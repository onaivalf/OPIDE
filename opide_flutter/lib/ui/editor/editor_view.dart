import 'package:flutter/material.dart';
import 'editor_buffer.dart';

/// Componente de UI para o Editor Virtualizado do OPIDE.
/// Renderiza apenas as linhas visíveis na tela para suportar arquivos massivos.
class EditorView extends StatefulWidget {
  final EditorBuffer buffer;

  const EditorView({super.key, required this.buffer});

  @override
  State<EditorView> createState() => _EditorViewState();
}

class _EditorViewState extends State<EditorView> {
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1E1E1E), // Fundo clássico do VS Code
      child: ListView.builder(
        controller: _scrollController,
        itemCount: widget.buffer.lineCount,
        itemExtent: 22.0, // Altura fixa de cada linha (otimização de scroll)
        itemBuilder: (context, index) {
          final lineContent = widget.buffer.getLine(index);
          final tokens = widget.buffer.getStylesForLine(index);

          return _EditorLine(
            lineNumber: index + 1,
            content: lineContent,
            tokens: tokens,
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}

class _EditorLine extends StatelessWidget {
  final int lineNumber;
  final String content;
  final List<TextToken> tokens;

  const _EditorLine({
    required this.lineNumber,
    required this.content,
    required this.tokens,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Números de linha (Gutter)
        Container(
          width: 48,
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 12),
          child: Text(
            '$lineNumber',
            style: const TextStyle(
              color: Color(0xFF858585),
              fontFamily: 'monospace',
              fontSize: 13,
            ),
          ),
        ),
        
        // Conteúdo da Linha (Pintura de Texto)
        Expanded(
          child: RichText(
            text: TextSpan(
              style: const TextStyle(
                color: Color(0xFFD4D4D4), // Cor padrão (cinza/branco)
                fontFamily: 'monospace',
                fontSize: 13,
              ),
              children: _buildTextSpans(),
            ),
            maxLines: 1,
            overflow: TextOverflow.clip,
          ),
        ),
      ],
    );
  }

  List<TextSpan> _buildTextSpans() {
    if (tokens.isEmpty) {
      return [TextSpan(text: content)];
    }

    final List<TextSpan> spans = [];
    int currentOffset = 0;

    for (final token in tokens) {
      // Texto normal antes do token
      if (token.start > currentOffset) {
        spans.add(TextSpan(
          text: content.substring(currentOffset, token.start),
        ));
      }

      // Texto estilizado (Token)
      final end = token.start + token.length;
      spans.add(TextSpan(
        text: content.substring(token.start, end),
        style: TextStyle(
          color: Color(token.colorHex),
        ),
      ));

      currentOffset = end;
    }

    // Resto do texto após o último token
    if (currentOffset < content.length) {
      spans.add(TextSpan(
        text: content.substring(currentOffset),
      ));
    }

    return spans;
  }
}
