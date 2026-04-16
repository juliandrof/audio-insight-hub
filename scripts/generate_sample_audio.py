#!/usr/bin/env python3
"""Generate sample SAC (Customer Service) audio files using gTTS."""

import os
import sys

try:
    from gtts import gTTS
except ImportError:
    print("Installing gTTS...")
    os.system(f"{sys.executable} -m pip install gTTS pydub")
    from gtts import gTTS

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_audios")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sample SAC scripts - complaints and praise in Portuguese
SCRIPTS = [
    {
        "filename": "reclamacao_internet_lenta.mp3",
        "lang": "pt",
        "text": """
Ola, boa tarde. Meu nome e Carlos Silva e eu estou ligando porque estou muito insatisfeito com o servico de internet que eu contratei.
Ja faz mais de duas semanas que a minha internet esta extremamente lenta. Eu contratei um plano de 200 megas e mal consigo assistir um video sem ficar travando.
Eu ja reiniciei o modem varias vezes, ja fiz todos os procedimentos que o suporte tecnico pediu, mas nada resolveu.
Alem disso, eu ja liguei tres vezes essa semana e toda vez me dizem que vao resolver, mas ate agora nada mudou.
Eu trabalho de casa e preciso muito da internet funcionando bem. Estou perdendo clientes por causa dessa lentidao.
Eu quero que voces enviem um tecnico aqui na minha casa o mais rapido possivel para resolver esse problema de uma vez por todas.
Se nao for resolvido ate o final dessa semana, vou ter que cancelar o meu plano e procurar outra operadora.
Eu pago caro pelo servico e mereco ter a qualidade que foi prometida no contrato.
Podem verificar no sistema, meu CPF e 123 456 789 zero zero. O endereco e Rua das Flores, numero 45, bairro Jardim America.
Fico aguardando uma solucao rapida. Muito obrigado.
        """,
    },
    {
        "filename": "elogio_atendimento_excelente.mp3",
        "lang": "pt",
        "text": """
Ola, bom dia! Meu nome e Maria Fernanda e eu estou ligando para fazer um elogio.
Ontem eu tive um problema com a minha fatura e liguei para o suporte. Fui atendida por um rapaz chamado Pedro, do setor financeiro.
Ele foi extremamente atencioso e profissional. Explicou tudo direitinho, com muita paciencia.
O Pedro resolveu meu problema em menos de dez minutos e ainda me deu dicas de como economizar no meu plano atual.
Fiquei muito satisfeita com o atendimento. E raro encontrar profissionais assim hoje em dia, que realmente se importam com o cliente.
Eu sou cliente de voces ha mais de cinco anos e esse tipo de atendimento faz toda a diferenca para continuar fiel a empresa.
Gostaria que esse elogio chegasse ate o supervisor do Pedro, porque ele realmente merece ser reconhecido.
Alem do atendimento, quero dizer que o servico de voces melhorou muito nos ultimos meses.
A internet esta rapida, o aplicativo funciona perfeitamente e os precos estao justos.
Parabens a toda equipe! Continuem assim. Muito obrigada!
        """,
    },
    {
        "filename": "reclamacao_cobranca_indevida.mp3",
        "lang": "pt",
        "text": """
Boa tarde, meu nome e Roberto Almeida e eu preciso resolver um problema urgente de cobranca.
No mes passado eu cancelei um servico adicional que eu tinha contratado, o pacote de canais premium.
Mesmo depois do cancelamento confirmado, eu recebi a fatura desse mes com a cobranca do pacote que eu ja cancelei.
Isso e um absurdo! Eu tenho o protocolo de cancelamento anotado aqui, e o numero 2024 barra 789456.
Eu exijo que essa cobranca seja estornada imediatamente e que a minha proxima fatura venha correta.
Alem disso, por causa dessa cobranca indevida, meu cartao de credito foi debitado automaticamente com um valor maior do que deveria.
Isso me causou problemas no banco porque eu nao tinha saldo suficiente para cobrir a diferenca.
Eu preciso que voces resolvam isso hoje, senao vou ter que procurar o Procon e registrar uma reclamacao formal.
Ja sou cliente ha tres anos e nunca tive problemas, mas essa situacao me deixou muito decepcionado.
Aguardo retorno urgente. Meu telefone para contato e 11 99876 5432. Obrigado.
        """,
    },
    {
        "filename": "elogio_produto_qualidade.mp3",
        "lang": "pt",
        "text": """
Oi, boa tarde! Aqui e a Ana Paula, sou cliente de voces e quero compartilhar minha experiencia.
Eu comprei o novo modelo do roteador que voces lancaram e estou impressionada com a qualidade.
A instalacao foi super facil, seguindo o passo a passo do aplicativo. Em menos de cinco minutos ja estava tudo funcionando.
O sinal do wifi alcanca todos os comodos da minha casa, incluindo o quintal, coisa que o roteador antigo nao fazia.
Meus filhos conseguem assistir aula online, jogar e eu consigo trabalhar, tudo ao mesmo tempo sem nenhuma queda.
A velocidade que aparece no teste e praticamente a mesma que eu contratei, o que nunca aconteceu antes.
Quero parabenizar a equipe de desenvolvimento pelo produto. Voces realmente ouviram as reclamacoes dos clientes e melhoraram.
O design do aparelho tambem ficou muito bonito, combina com a decoracao da casa.
Ja recomendei para varios amigos e familiares. Todos ficaram interessados.
Enfim, muito obrigada por oferecerem um produto de qualidade a um preco acessivel. Estou muito satisfeita!
        """,
    },
    {
        "filename": "reclamacao_demora_entrega.mp3",
        "lang": "pt",
        "text": """
Alo, boa noite. Meu nome e Lucas Oliveira e estou ligando para reclamar sobre um pedido que fiz.
Eu fiz uma compra no site de voces no dia primeiro desse mes, ja se passaram quinze dias e meu pedido ainda nao chegou.
O prazo de entrega era de cinco dias uteis, ou seja, ja estourou em mais de uma semana.
Quando eu rastreio o pedido no site, aparece a mesma mensagem ha dias dizendo que esta em transporte para a minha cidade.
Eu ja mandei tres emails para o suporte e nenhum foi respondido. Tentei o chat online e fiquei na fila por mais de uma hora sem ser atendido.
Isso e inaceitavel! Eu paguei o frete expresso justamente para receber mais rapido.
Quero saber onde esta o meu pedido e quando ele vai ser entregue. Se nao chegar ate amanha, quero o reembolso completo, incluindo o frete.
O numero do meu pedido e PED 2024 03 15789. Meu email e lucas ponto oliveira arroba email ponto com.
Espero que voces tratem esse caso com a urgencia que ele merece. Estou muito frustrado com essa experiencia.
Obrigado e fico no aguardo.
        """,
    },
    {
        "filename": "elogio_suporte_tecnico.mp3",
        "lang": "pt",
        "text": """
Bom dia! Meu nome e Juliana Costa e gostaria de deixar registrado um elogio ao suporte tecnico de voces.
Na semana passada, meu computador apresentou um problema serio e eu pensei que tinha perdido todos os meus arquivos.
Liguei desesperada para o suporte e fui atendida pela tecnica Camila. Ela foi incrivel!
Primeiro, ela me acalmou e explicou que provavelmente nao era nada grave. Depois, me guiou passo a passo pelo processo de recuperacao.
Levamos quase uma hora no telefone, mas a Camila teve toda a paciencia do mundo. Ela nunca me apressou e sempre confirmava se eu tinha entendido cada etapa.
No final, conseguimos recuperar todos os meus arquivos e o computador voltou a funcionar perfeitamente.
A Camila ainda me ensinou a fazer backup automatico para evitar esse tipo de susto no futuro.
Eu fico muito grata por ter profissionais assim na equipe de voces. Isso mostra o compromisso da empresa com os clientes.
Por favor, reconhecam o trabalho da Camila. Ela e uma profissional excepcional.
Muito obrigada por tudo! Voces ganharam uma cliente fiel.
        """,
    },
    {
        "filename": "sugestao_melhorias_app.mp3",
        "lang": "pt",
        "text": """
Ola, boa tarde. Meu nome e Fernando Santos e eu gostaria de dar algumas sugestoes sobre o aplicativo de voces.
Eu uso o app todos os dias e no geral gosto muito, mas acho que tem algumas melhorias que poderiam ser feitas.
Primeiro, seria otimo ter uma opcao de modo escuro. Eu costumo usar o app a noite e a tela muito clara incomoda os olhos.
Segundo, o processo de pagamento poderia ser mais simples. Hoje em dia tem muitos passos ate finalizar uma compra.
Se tivesse a opcao de salvar o cartao e fazer pagamento com um clique, seria muito mais pratico.
Terceiro, acho que falta uma funcao de busca mais inteligente. Quando eu pesquiso um produto, os resultados nem sempre sao relevantes.
Seria legal ter filtros mais detalhados, por preco, por avaliacao, por marca.
Quarto, o sistema de notificacoes precisa melhorar. Recebo muitas notificacoes que nao me interessam e nao consigo personalizar.
No mais, o app e muito bom. O design e bonito, e rapido e tem bastante variedade de produtos.
Espero que essas sugestoes sejam uteis para voces. Obrigado pela atencao!
        """,
    },
    {
        "filename": "reclamacao_atendimento_ruim.mp3",
        "lang": "pt",
        "text": """
Boa tarde, meu nome e Patricia Mendes e infelizmente preciso fazer uma reclamacao seria.
Hoje de manha eu fui ate a loja de voces no shopping para resolver um problema com o meu aparelho.
O atendente que me recebeu foi extremamente mal educado e desrespeitoso. Ele mal me ouviu e ja foi dizendo que o problema era minha culpa.
Eu tentei explicar a situacao com calma, mas ele ficava me interrompendo e revirando os olhos.
Quando pedi para falar com o gerente, ele disse que o gerente nao estava e que eu voltasse outro dia.
Eu fiquei mais de meia hora na loja e sai sem nenhuma resolucao para o meu problema.
Isso e totalmente inaceitavel. Um profissional que trabalha com atendimento ao publico precisa ter no minimo educacao e respeito.
Eu tenho o nome dele anotado aqui no cracha, se chama Rafael, da loja do Shopping Central.
Exijo que providencias sejam tomadas em relacao a esse funcionario e que meu problema seja resolvido o mais rapido possivel.
Meu numero de protocolo da visita e ATD 2024 barra 456. Aguardo retorno. Obrigada.
        """,
    },
]


def generate_audio(script):
    filepath = os.path.join(OUTPUT_DIR, script["filename"])
    if os.path.exists(filepath):
        print(f"  Already exists: {script['filename']}")
        return

    print(f"  Generating: {script['filename']}...")
    tts = gTTS(text=script["text"].strip(), lang=script["lang"], slow=False)
    tts.save(filepath)
    size = os.path.getsize(filepath)
    print(f"  Created: {script['filename']} ({size / 1024:.0f} KB)")


if __name__ == "__main__":
    print(f"Generating {len(SCRIPTS)} sample SAC audio files...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    for i, script in enumerate(SCRIPTS, 1):
        print(f"[{i}/{len(SCRIPTS)}]")
        generate_audio(script)
        print()

    print("Done! All audio files generated successfully.")
    print(f"\nFiles in {OUTPUT_DIR}:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
        print(f"  {f} ({size / 1024:.0f} KB)")
