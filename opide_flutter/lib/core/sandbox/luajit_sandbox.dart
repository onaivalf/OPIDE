import 'dart:ffi' as ffi;
import 'package:ffi/ffi.dart';

// Definições de tipo nativas para a API do Lua C
typedef LuaLNewStateNative = ffi.Pointer<ffi.Void> Function();
typedef LuaLNewState = ffi.Pointer<ffi.Void> Function();

typedef LuaLOpenLibsNative = ffi.Void Function(ffi.Pointer<ffi.Void> L);
typedef LuaLOpenLibs = void Function(ffi.Pointer<ffi.Void> L);

typedef LuaLLoadStringNative = ffi.Int32 Function(ffi.Pointer<ffi.Void> L, ffi.Pointer<ffi.Char> s);
typedef LuaLLoadString = int Function(ffi.Pointer<ffi.Void> L, ffi.Pointer<ffi.Char> s);

typedef LuaPcallNative = ffi.Int32 Function(
  ffi.Pointer<ffi.Void> L,
  ffi.Int32 nargs,
  ffi.Int32 nresults,
  ffi.Int32 errfunc,
);
typedef LuaPcall = int Function(
  ffi.Pointer<ffi.Void> L,
  int nargs,
  int nresults,
  int errfunc,
);

typedef LuaCloseNative = ffi.Void Function(ffi.Pointer<ffi.Void> L);
typedef LuaClose = void Function(ffi.Pointer<ffi.Void> L);

/// Sandbox para execução de scripts de extensão ultra-leves usando LuaJIT via Dart FFI.
class LuaJitSandbox {
  late ffi.DynamicLibrary _luaLib;
  ffi.Pointer<ffi.Void>? _luaState;

  late LuaLNewState _luaLNewstate;
  late LuaLOpenLibs _luaLOpenlibs;
  late LuaLLoadString _luaLLoadstring;
  late LuaPcall _luaPcall;
  late LuaClose _luaClose;

  bool _initialized = false;
  bool get isInitialized => _initialized;

  /// Inicializa a máquina virtual LuaJIT carregando a biblioteca dinâmica (.dll/.so/.dylib)
  void initialize(String libraryPath) {
    try {
      _luaLib = ffi.DynamicLibrary.open(libraryPath);

      _luaLNewstate = _luaLib
          .lookup<ffi.NativeFunction<LuaLNewStateNative>>('luaL_newstate')
          .asFunction<LuaLNewState>();

      _luaLOpenlibs = _luaLib
          .lookup<ffi.NativeFunction<LuaLOpenLibsNative>>('luaL_openlibs')
          .asFunction<LuaLOpenLibs>();

      _luaLLoadstring = _luaLib
          .lookup<ffi.NativeFunction<LuaLLoadStringNative>>('luaL_loadstring')
          .asFunction<LuaLLoadString>();

      _luaPcall = _luaLib
          .lookup<ffi.NativeFunction<LuaPcallNative>>('lua_pcall')
          .asFunction<LuaPcall>();

      _luaClose = _luaLib
          .lookup<ffi.NativeFunction<LuaCloseNative>>('lua_close')
          .asFunction<LuaClose>();

      // Cria o estado lógico da VM
      _luaState = _luaLNewstate();
      _luaLOpenlibs(_luaState!);

      _initialized = true;
      print('[LuaJIT] Sandbox inicializada com sucesso.');
    } catch (e) {
      print('[LuaJIT] Erro ao carregar ou inicializar a biblioteca: $e');
    }
  }

  /// Executa uma string de código Lua de forma isolada na sandbox
  bool execute(String code) {
    if (!_initialized || _luaState == null) {
      throw StateError('Sandbox LuaJIT não foi inicializada corretamente.');
    }

    final codePtr = code.toNativeUtf8();
    final loadStatus = _luaLLoadstring(_luaState!, codePtr.cast<ffi.Char>());
    malloc.free(codePtr);

    if (loadStatus != 0) {
      print('[LuaJIT] Erro de compilação do script.');
      return false;
    }

    final runStatus = _luaPcall(_luaState!, 0, 0, 0);
    if (runStatus != 0) {
      print('[LuaJIT] Erro de execução do script.');
      return false;
    }

    return true;
  }

  /// Fecha a VM e libera os recursos
  void dispose() {
    if (_luaState != null) {
      _luaClose(_luaState!);
      _luaState = null;
    }
    _initialized = false;
  }
}
