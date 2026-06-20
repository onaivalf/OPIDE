import 'dart:ffi' as ffi;
import 'dart:convert';
import 'package:ffi/ffi.dart';

// Definições de tipo para as funções do C
typedef TSLanguageFunc = ffi.Pointer<ffi.Void> Function();

typedef TSParserNewNative = ffi.Pointer<ffi.Void> Function();
typedef TSParserNew = ffi.Pointer<ffi.Void> Function();

typedef TSParserSetLanguageNative = ffi.Bool Function(ffi.Pointer<ffi.Void> parser, ffi.Pointer<ffi.Void> language);
typedef TSParserSetLanguage = bool Function(ffi.Pointer<ffi.Void> parser, ffi.Pointer<ffi.Void> language);

typedef TSParserParseStringNative = ffi.Pointer<ffi.Void> Function(
  ffi.Pointer<ffi.Void> parser,
  ffi.Pointer<ffi.Void> oldTree,
  ffi.Pointer<ffi.Char> string,
  ffi.Uint32 length,
);
typedef TSParserParseString = ffi.Pointer<ffi.Void> Function(
  ffi.Pointer<ffi.Void> parser,
  ffi.Pointer<ffi.Void> oldTree,
  ffi.Pointer<ffi.Char> string,
  int length,
);

/// Ponte de interoperabilidade nativa (FFI) com o Tree-sitter.
class TreeSitter {
  late ffi.DynamicLibrary _treeSitterLib;

  late TSParserNew _parserNew;
  late TSParserSetLanguage _parserSetLanguage;
  late TSParserParseString _parserParseString;

  bool _loaded = false;
  bool get isLoaded => _loaded;

  /// Carrega a biblioteca dinâmica do Tree-sitter
  void load(String libraryPath) {
    try {
      _treeSitterLib = ffi.DynamicLibrary.open(libraryPath);

      _parserNew = _treeSitterLib
          .lookup<ffi.NativeFunction<TSParserNewNative>>('ts_parser_new')
          .asFunction<TSParserNew>();

      _parserSetLanguage = _treeSitterLib
          .lookup<ffi.NativeFunction<TSParserSetLanguageNative>>('ts_parser_set_language')
          .asFunction<TSParserSetLanguage>();

      _parserParseString = _treeSitterLib
          .lookup<ffi.NativeFunction<TSParserParseStringNative>>('ts_parser_parse_string')
          .asFunction<TSParserParseString>();

      _loaded = true;
      print('[TreeSitter] Biblioteca carregada com sucesso.');
    } catch (e) {
      print('[TreeSitter] Falha ao carregar biblioteca: $e');
    }
  }

  /// Cria uma nova instância de Parser
  ffi.Pointer<ffi.Void> createParser() {
    if (!_loaded) throw StateError('Biblioteca Tree-sitter não carregada.');
    return _parserNew();
  }

  /// Define a linguagem (ex: C, Python, JavaScript) do Parser
  bool setLanguage(ffi.Pointer<ffi.Void> parser, ffi.Pointer<ffi.Void> language) {
    return _parserSetLanguage(parser, language);
  }

  /// Faz o parse de uma string e retorna o nó raiz da árvore
  ffi.Pointer<ffi.Void> parseString(ffi.Pointer<ffi.Void> parser, String source) {
    final units = utf8.encode(source);
    final pointer = calloc<ffi.Char>(units.length);
    pointer.cast<ffi.Uint8>().asTypedList(units.length).setAll(0, units);
    
    final tree = _parserParseString(parser, ffi.nullptr, pointer, units.length);
    
    calloc.free(pointer);
    return tree;
  }
}
