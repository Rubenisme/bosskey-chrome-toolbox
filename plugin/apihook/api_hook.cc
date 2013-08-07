#include "api_hook.h"

#include <ImageHlp.h>
#include <TlHelp32.h>

#include "log.h"

extern Log g_log;
extern HMODULE g_module;

///////////////////////////////////////////////////////////////////////////////


// The head of the linked-list of ApiHook objects
ApiHook* ApiHook::head_pointer_ = NULL;
ApiHook* ApiHook::load_libraray_a_ = NULL;
ApiHook* ApiHook::load_libraray_w_ = NULL;
ApiHook* ApiHook::load_libraray_ex_a_ = NULL;
ApiHook* ApiHook::load_libraray_ex_w_ = NULL;
ApiHook* ApiHook::create_process_a_ = NULL;
ApiHook* ApiHook::create_process_w_ = NULL;
ApiHook* ApiHook::get_proc_address_ = NULL;

///////////////////////////////////////////////////////////////////////////////

ApiHook::ApiHook(PSTR calleemodname, PSTR funcname, PROC pfnhook, BOOL flag) {

  next_pointer_  = head_pointer_;    // The next node was at the head
  head_pointer_ = this;              // This node is now at the head

  // Save information about this hooked function
  callee_module_name_ = calleemodname;
  func_name_ = funcname;
  pfn_hook_ = pfnhook;
  exclude_hook_module_ = flag;
  pfn_orig_ = GetProcAddressRaw(GetModuleHandleA(callee_module_name_),
                                func_name_);

  // Hook this function in all currently loaded modules
  ReplaceIATEntryInAllMods(callee_module_name_, pfn_orig_, pfn_hook_,
                           exclude_hook_module_);
}


ApiHook::~ApiHook() {

  // Unhook this function from all modules
  if (pfn_orig_)
    ReplaceIATEntryInAllMods(callee_module_name_, pfn_hook_, pfn_orig_,
                             exclude_hook_module_);

  // Remove this object from the linked list
  ApiHook* p = head_pointer_;
  if (!p)
    return;

  if (p == this) {     // Removing the head node
    head_pointer_ = p->next_pointer_;
  } else {

    BOOL fFound = FALSE;

    // Walk list from head and fix pointers
    for (; !fFound && (p->next_pointer_ != NULL); p = p->next_pointer_) {
      if (p->next_pointer_ == this) {
        // Make the node that points to us point to the our next node
        p->next_pointer_ = p->next_pointer_->next_pointer_;
        break;
      }
    }
  }
}


// NOTE: This function must NOT be inlined
FARPROC ApiHook::GetProcAddressRaw(HMODULE hmod, PCSTR procname) {

  return(::GetProcAddress(hmod, procname));
}

static HMODULE ModuleFromAddress(PVOID pv) {

  MEMORY_BASIC_INFORMATION mbi;
  return((VirtualQuery(pv, &mbi, sizeof(mbi)) != 0)
    ? (HMODULE) mbi.AllocationBase : NULL);
}

void ApiHook::ReplaceIATEntryInAllMods(PCSTR calleemodulename, PROC pfnorig,
                                       PROC pfnhook, BOOL flag) {
  HMODULE thismod = flag ? ModuleFromAddress(ReplaceIATEntryInAllMods) : NULL;

  // Get the list of modules in this process
  HANDLE h = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE,
                                      GetCurrentProcessId());
  if (h == INVALID_HANDLE_VALUE) {
    g_log.WriteLog("Error", "CreateToolhelp32Snapshot Failed.");
    return;
  }

  MODULEENTRY32 me = { sizeof(me) };
  for (BOOL fOk = Module32First(h, &me); fOk; fOk = Module32Next(h, &me)) {
    // NOTE: We don't hook functions in our own module
    if (me.hModule != thismod) {
      // Hook this function in this module
      if (_tcsicmp(me.szModule, _T("convenience.dll")) == 0)
        continue;
      ReplaceIATEntryInOneMod(calleemodulename, pfnorig, pfnhook, me.hModule);
    }
  }
}

void ApiHook::ReplaceIATEntryInOneMod(PCSTR calleemodulename, PROC pfnorig,
                                      PROC pfnhook, HMODULE hmodcaller) {
  // Get the address of the module's import section
  ULONG ulSize;
  PIMAGE_IMPORT_DESCRIPTOR pImportDesc = (PIMAGE_IMPORT_DESCRIPTOR)
      ImageDirectoryEntryToData(hmodcaller, TRUE,
      IMAGE_DIRECTORY_ENTRY_IMPORT, &ulSize);

  if (pImportDesc == NULL)
    return;  // This module has no import section

  // Find the import descriptor containing references to callee's functions
  for (; pImportDesc->Name; pImportDesc++) {
    PSTR pszModName = (PSTR) ((PBYTE) hmodcaller + pImportDesc->Name);
    if (lstrcmpiA(pszModName, calleemodulename) == 0)
      break;   // Found
  }

  if (pImportDesc->Name == 0)
    return;  // This module doesn't import any functions from this callee

  // Get caller's import address table (IAT) for the callee's functions
  PIMAGE_THUNK_DATA pThunk = (PIMAGE_THUNK_DATA)
      ((PBYTE) hmodcaller + pImportDesc->FirstThunk);

  // Replace current function address with new function address
  for (; pThunk->u1.Function; pThunk++) {
    // Get the address of the function address
    PROC* ppfn = (PROC*) &pThunk->u1.Function;
    // Is this the function we're looking for?
    BOOL fFound = (*ppfn == pfnorig);

    if (fFound) {
      // The addresses match, change the import section address
      DWORD oldAccess, newAccess;
      if (VirtualProtect(ppfn, sizeof(pfnhook),
                         PAGE_EXECUTE_READWRITE, &oldAccess)) {
        if (!WriteProcessMemory(GetCurrentProcess(), ppfn, &pfnhook,
            sizeof(pfnhook), NULL)) {
          char logs[256];
          sprintf(logs, "WriteProcessMemory Failed, GetLastError=%ld, ppfn=%ld",
                  GetLastError(), ppfn);
          g_log.WriteLog("ReplaceIATError", logs);
        }
        if (!VirtualProtect(ppfn, sizeof(pfnhook), oldAccess, &newAccess)) {
          char logs[256];
          sprintf(logs, "VirtualProtect Failed 1, GetLastError=%ld",
                  GetLastError());
          g_log.WriteLog("Error", logs);
        }
      } else {
        char logs[256];
        sprintf(logs, "VirtualProtect Failed 2, GetLastError=%ld",
                GetLastError());
        g_log.WriteLog("Error", logs);
      }
      return;  // We did it, get out
    }
  }
  // If we get to here, the function is not in the caller's import section
}

void ApiHook::Init() {
  load_libraray_a_ = new ApiHook("Kernel32.dll", "LoadLibraryA",
                                 (PROC)ApiHook::LoadLibraryA, TRUE);
  load_libraray_w_ = new ApiHook("Kernel32.dll", "LoadLibraryW",
                                 (PROC)ApiHook::LoadLibraryW, TRUE);
  load_libraray_ex_a_ = new ApiHook("Kernel32.dll", "LoadLibraryExA",
                                    (PROC)ApiHook::LoadLibraryExA, TRUE);
  load_libraray_ex_w_ = new ApiHook("Kernel32.dll", "LoadLibraryExW",
                                  (PROC) ApiHook::LoadLibraryExW, TRUE);
  get_proc_address_ = new ApiHook("Kernel32.dll", "GetProcAddress",
                                  (PROC) ApiHook::GetProcAddress, TRUE);
  create_process_a_ = new ApiHook("Kernel32.dll", "CreateProcessA",
                                  (PROC) ApiHook::CreateProcessA, TRUE);
  create_process_w_ = new ApiHook("Kernel32.dll", "CreateProcessW",
                                  (PROC) ApiHook::CreateProcessW, TRUE);
}

void ApiHook::UnInit() {
  delete load_libraray_a_;
  delete load_libraray_w_;
  delete load_libraray_ex_a_;
  delete load_libraray_ex_w_;
  delete get_proc_address_;
  delete create_process_a_;
  delete create_process_w_;
}

void ApiHook::FixupNewlyLoadedModule(HMODULE hmod, DWORD dwFlags) {

  // If a new module is loaded, hook the hooked functions
  if ((hmod != NULL) && ((dwFlags & LOAD_LIBRARY_AS_DATAFILE) == 0)) {
    for (ApiHook* p = head_pointer_; p != NULL; p = p->next_pointer_) {
      if (!p->pfn_orig_) {
        p->pfn_orig_ = GetProcAddressRaw(GetModuleHandleA(
            p->callee_module_name_), p->func_name_);
      }
      if (p->pfn_orig_) {
        ReplaceIATEntryInOneMod(p->callee_module_name_,
          p->pfn_orig_, p->pfn_hook_, hmod);
      }
    }
  }
}

HMODULE WINAPI ApiHook::LoadLibraryA(PCSTR pszModulePath) {
  HMODULE hmod = ::LoadLibraryA(pszModulePath);
  if (strstr(pszModulePath, "convenience.dll") != NULL)
    return hmod;
  if (hmod != ModuleFromAddress(ReplaceIATEntryInAllMods))
    FixupNewlyLoadedModule(hmod, 0);
  return(hmod);
}

HMODULE WINAPI ApiHook::LoadLibraryW(PCWSTR pszModulePath) {
  HMODULE hmod = ::LoadLibraryW(pszModulePath);
  if (wcsstr(pszModulePath, L"convenience.dll") != NULL)
    return hmod;
  if (hmod != ModuleFromAddress(ReplaceIATEntryInAllMods))
    FixupNewlyLoadedModule(hmod, 0);
  return(hmod);
}

HMODULE WINAPI ApiHook::LoadLibraryExA(PCSTR pszModulePath,
                                       HANDLE hFile, DWORD dwFlags) {
  HMODULE hmod = ::LoadLibraryExA(pszModulePath, hFile, dwFlags);
  if (hmod != ModuleFromAddress(ReplaceIATEntryInAllMods))
    FixupNewlyLoadedModule(hmod, dwFlags);
  return(hmod);
}

HMODULE WINAPI ApiHook::LoadLibraryExW(PCWSTR pszModulePath,
                                       HANDLE hFile, DWORD dwFlags) {
  HMODULE hmod = ::LoadLibraryExW(pszModulePath, hFile, dwFlags);
  if (hmod != ModuleFromAddress(ReplaceIATEntryInAllMods))
    FixupNewlyLoadedModule(hmod, dwFlags);
  return(hmod);
}

void WINAPI InjectIntoProcess(HANDLE hprocess) {
  TCHAR dllpath[MAX_PATH];
  LPVOID memory_pointer = VirtualAllocEx(hprocess, NULL,
      sizeof(dllpath), MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);

  char logs[256];
  if (memory_pointer) {
    if (!g_module)
      g_module = ModuleFromAddress(InjectIntoProcess);
    GetModuleFileName(g_module, dllpath, MAX_PATH);
    BOOL ret = WriteProcessMemory(hprocess, memory_pointer, dllpath,
                                  sizeof(dllpath), NULL);
    if (!ret) {
      sprintf(logs, "WriteProcessMemory Failed, GetLastError=%ld",
              GetLastError());
      g_log.WriteLog("Error", logs);
      return;
    }

    HANDLE remote_thread = CreateRemoteThread(hprocess, NULL, 0,
        (LPTHREAD_START_ROUTINE)LoadLibrary, memory_pointer, 0, NULL);
    if (remote_thread) {
      g_log.WriteLog("Msg", "CreateRemoteThread Success");
      CloseHandle(remote_thread);
    } else {
      sprintf(logs, "CreateRemoteThread Failed, GetLastError=%ld",
              GetLastError());
      g_log.WriteLog("Error", logs);
    }
  } else {
    sprintf(logs, "VirtualAllocEx Failed, GetLastError=%ld", GetLastError());
    g_log.WriteLog("Error", logs);
  }
}

BOOL WINAPI ApiHook::CreateProcessA(LPCSTR lpApplicationName,
                                    LPSTR lpCommandLine,
                                    LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                    LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                    BOOL bInheritHandles,
                                    DWORD dwCreationFlags,
                                    LPVOID lpEnvironment,
                                    LPCSTR lpCurrentDirectory,
                                    LPSTARTUPINFOA lpStartupInfo,
                                    LPPROCESS_INFORMATION lpProcessInformation) {
  BOOL ret = ::CreateProcessA(lpApplicationName, lpCommandLine,
      lpProcessAttributes, lpThreadAttributes, bInheritHandles,
      dwCreationFlags, lpEnvironment, lpCurrentDirectory, lpStartupInfo,
      lpProcessInformation);
  if (ret) {
    char logs[256];
    sprintf(logs, "CreateProcessA, ProcessID=%ld",
            lpProcessInformation->dwProcessId);
    g_log.WriteLog("Msg", logs);
    if (lpCommandLine != NULL && strstr(lpCommandLine, "--type=plugin") != 0 &&
        !strstr(lpCommandLine, "npaliedit.dll") &&
        !strstr(lpCommandLine, "npqqedit.dll") &&
        !strstr(lpCommandLine, "npqqcert.dll"))
      InjectIntoProcess(lpProcessInformation->hProcess);
  }
  return ret;
}

BOOL WINAPI ApiHook::CreateProcessW(LPCWSTR lpApplicationName,
                                    LPWSTR lpCommandLine,
                                    LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                    LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                    BOOL bInheritHandles,
                                    DWORD dwCreationFlags,
                                    LPVOID lpEnvironment,
                                    LPCWSTR lpCurrentDirectory,
                                    LPSTARTUPINFOW lpStartupInfo,
                                    LPPROCESS_INFORMATION lpProcessInformation) {
  BOOL ret = ::CreateProcessW(lpApplicationName, lpCommandLine,
      lpProcessAttributes, lpThreadAttributes, bInheritHandles,
      dwCreationFlags, lpEnvironment, lpCurrentDirectory, lpStartupInfo,
      lpProcessInformation);
  if (ret) {
    char logs[256];
    sprintf(logs, "CreateProcessW, ProcessID=%ld",
            lpProcessInformation->dwProcessId);
    g_log.WriteLog("Msg", logs);
    if (lpCommandLine != NULL && wcsstr(lpCommandLine, L"--type=plugin") != 0 &&
        !wcsstr(lpCommandLine, L"npaliedit.dll") &&
        !wcsstr(lpCommandLine, L"npqqedit.dll") &&
        !wcsstr(lpCommandLine, L"npqqcert.dll"))
      InjectIntoProcess(lpProcessInformation->hProcess);
  }
  return ret;
}

FARPROC WINAPI ApiHook::GetProcAddress(HMODULE hmod, PCSTR pszProcName) {

  // Get the true address of the function
  FARPROC pfn = GetProcAddressRaw(hmod, pszProcName);
  // Is it one of the functions that we want hooked?
  ApiHook* p = head_pointer_;
  for (; (pfn != NULL) && (p != NULL); p = p->next_pointer_) {

    if (pfn == p->pfn_orig_) {

      // The address to return matches an address we want to hook
      // Return the hook function address instead
      pfn = p->pfn_hook_;
      break;
    }
  }

  return(pfn);
}
