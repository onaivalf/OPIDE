/// Representação lógica de um arquivo aberto no editor do OPIDE.
class EditorBuffer {
  final List<String> _lines = [];
  
  // Cache de tokens/estilos para cada linha (índice da linha -> lista de spans)
  final Map<int, List<TextToken>> _stylesCache = {};

  EditorBuffer();

  void setContent(String content) {
    _lines.clear();
    _lines.addAll(content.split('\n'));
    _stylesCache.clear();
  }

  int get lineCount => _lines.length;

  String getLine(int index) {
    if (index < 0 || index >= _lines.length) return '';
    return _lines[index];
  }

  List<TextToken> getStylesForLine(int index) {
    return _stylesCache[index] ?? [];
  }

  void setStylesForLine(int index, List<TextToken> tokens) {
    _stylesCache[index] = tokens;
  }
}

/// Token lógico de estilo para pintura de texto
class TextToken {
  final int start;
  final int length;
  final int colorHex;

  TextToken({
    required this.start,
    required this.length,
    required this.colorHex,
  });
}
