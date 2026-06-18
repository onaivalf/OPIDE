# Template Python - Iniciante
# Este é um arquivo de exemplo para o modo educacional

def saudacao(nome: str) -> str:
    """
    Função simples que retorna uma saudação.
    
    Args:
        nome (str): O nome da pessoa a ser saudada.
    
    Returns:
        str: Uma mensagem de saudação.
    """
    return f"Olá, {nome}! Bem-vindo ao OPIDE!"

# TODO: Chame a função saudacao com seu nome abaixo
# Exemplo: print(saudacao("Seu Nome"))

if __name__ == "__main__":
    # Execute este arquivo para ver o resultado
    print(saudacao("Estudante"))
