#!/bin/bash
# Generate sample SAC audio files using macOS say + ffmpeg
set -e

OUTPUT_DIR="$(dirname "$(dirname "$0")")/sample_audios"
mkdir -p "$OUTPUT_DIR"

generate_audio() {
    local filename="$1"
    local voice="$2"
    local text="$3"
    local rate="$4"

    local aiff_file="/tmp/${filename%.mp3}.aiff"
    local mp3_file="$OUTPUT_DIR/$filename"

    if [ -f "$mp3_file" ]; then
        echo "  Already exists: $filename"
        return
    fi

    echo "  Generating: $filename (voice: $voice)..."
    say -v "$voice" -r "$rate" -o "$aiff_file" "$text"
    ffmpeg -y -i "$aiff_file" -acodec libmp3lame -ab 128k -ar 44100 "$mp3_file" 2>/dev/null
    rm -f "$aiff_file"

    local size
    size=$(du -k "$mp3_file" | cut -f1)
    echo "  Created: $filename (${size} KB)"
}

echo "Generating sample SAC audio files..."
echo "Output: $OUTPUT_DIR"
echo ""

echo "[1/8] Reclamacao - Internet Lenta"
generate_audio "reclamacao_internet_lenta.mp3" "Luciana" "Olá, boa tarde. Meu nome é Carlos Silva e eu estou ligando porque estou muito insatisfeito com o serviço de internet que eu contratei. Já faz mais de duas semanas que a minha internet está extremamente lenta. Eu contratei um plano de 200 megas e mal consigo assistir um vídeo sem ficar travando. Eu já reiniciei o modem várias vezes, já fiz todos os procedimentos que o suporte técnico pediu, mas nada resolveu. Além disso, eu já liguei três vezes essa semana e toda vez me dizem que vão resolver, mas até agora nada mudou. Eu trabalho de casa e preciso muito da internet funcionando bem. Estou perdendo clientes por causa dessa lentidão. Eu quero que vocês enviem um técnico aqui na minha casa o mais rápido possível para resolver esse problema de uma vez por todas. Se não for resolvido até o final dessa semana, vou ter que cancelar o meu plano e procurar outra operadora. Eu pago caro pelo serviço e mereço ter a qualidade que foi prometida no contrato." "170"

echo "[2/8] Elogio - Atendimento Excelente"
generate_audio "elogio_atendimento_excelente.mp3" "Flo (Portuguese (Brazil))" "Olá, bom dia! Meu nome é Maria Fernanda e eu estou ligando para fazer um elogio. Ontem eu tive um problema com a minha fatura e liguei para o suporte. Fui atendida por um rapaz chamado Pedro, do setor financeiro. Ele foi extremamente atencioso e profissional. Explicou tudo direitinho, com muita paciência. O Pedro resolveu meu problema em menos de dez minutos e ainda me deu dicas de como economizar no meu plano atual. Fiquei muito satisfeita com o atendimento. É raro encontrar profissionais assim hoje em dia, que realmente se importam com o cliente. Eu sou cliente de vocês há mais de cinco anos e esse tipo de atendimento faz toda a diferença para continuar fiel à empresa. Gostaria que esse elogio chegasse até o supervisor do Pedro, porque ele realmente merece ser reconhecido. Além do atendimento, quero dizer que o serviço de vocês melhorou muito nos últimos meses. A internet está rápida, o aplicativo funciona perfeitamente e os preços estão justos. Parabéns a toda equipe! Continuem assim." "165"

echo "[3/8] Reclamacao - Cobranca Indevida"
generate_audio "reclamacao_cobranca_indevida.mp3" "Reed (Portuguese (Brazil))" "Boa tarde, meu nome é Roberto Almeida e eu preciso resolver um problema urgente de cobrança. No mês passado eu cancelei um serviço adicional que eu tinha contratado, o pacote de canais premium. Mesmo depois do cancelamento confirmado, eu recebi a fatura desse mês com a cobrança do pacote que eu já cancelei. Isso é um absurdo! Eu tenho o protocolo de cancelamento anotado aqui, o número é 2024 barra 789456. Eu exijo que essa cobrança seja estornada imediatamente e que a minha próxima fatura venha correta. Além disso, por causa dessa cobrança indevida, meu cartão de crédito foi debitado automaticamente com um valor maior do que deveria. Isso me causou problemas no banco porque eu não tinha saldo suficiente para cobrir a diferença. Eu preciso que vocês resolvam isso hoje, senão vou ter que procurar o Procon e registrar uma reclamação formal. Já sou cliente há três anos e nunca tive problemas, mas essa situação me deixou muito decepcionado." "170"

echo "[4/8] Elogio - Produto Qualidade"
generate_audio "elogio_produto_qualidade.mp3" "Sandy (Portuguese (Brazil))" "Oi, boa tarde! Aqui é a Ana Paula, sou cliente de vocês e quero compartilhar minha experiência. Eu comprei o novo modelo do roteador que vocês lançaram e estou impressionada com a qualidade. A instalação foi super fácil, seguindo o passo a passo do aplicativo. Em menos de cinco minutos já estava tudo funcionando. O sinal do wifi alcança todos os cômodos da minha casa, incluindo o quintal, coisa que o roteador antigo não fazia. Meus filhos conseguem assistir aula online, jogar e eu consigo trabalhar, tudo ao mesmo tempo sem nenhuma queda. A velocidade que aparece no teste é praticamente a mesma que eu contratei, o que nunca aconteceu antes. Quero parabenizar a equipe de desenvolvimento pelo produto. Vocês realmente ouviram as reclamações dos clientes e melhoraram. O design do aparelho também ficou muito bonito, combina com a decoração da casa. Já recomendei para vários amigos e familiares. Enfim, muito obrigada por oferecerem um produto de qualidade a um preço acessível!" "165"

echo "[5/8] Reclamacao - Demora Entrega"
generate_audio "reclamacao_demora_entrega.mp3" "Eddy (Portuguese (Brazil))" "Alô, boa noite. Meu nome é Lucas Oliveira e estou ligando para reclamar sobre um pedido que fiz. Eu fiz uma compra no site de vocês no dia primeiro desse mês, já se passaram quinze dias e meu pedido ainda não chegou. O prazo de entrega era de cinco dias úteis, ou seja, já estourou em mais de uma semana. Quando eu rastreio o pedido no site, aparece a mesma mensagem há dias dizendo que está em transporte para a minha cidade. Eu já mandei três emails para o suporte e nenhum foi respondido. Tentei o chat online e fiquei na fila por mais de uma hora sem ser atendido. Isso é inaceitável! Eu paguei o frete expresso justamente para receber mais rápido. Quero saber onde está o meu pedido e quando ele vai ser entregue. Se não chegar até amanhã, quero o reembolso completo, incluindo o frete. O número do meu pedido é PED 2024 03 15789. Espero que vocês tratem esse caso com a urgência que ele merece." "175"

echo "[6/8] Elogio - Suporte Tecnico"
generate_audio "elogio_suporte_tecnico.mp3" "Luciana" "Bom dia! Meu nome é Juliana Costa e gostaria de deixar registrado um elogio ao suporte técnico de vocês. Na semana passada, meu computador apresentou um problema sério e eu pensei que tinha perdido todos os meus arquivos. Liguei desesperada para o suporte e fui atendida pela técnica Camila. Ela foi incrível! Primeiro, ela me acalmou e explicou que provavelmente não era nada grave. Depois, me guiou passo a passo pelo processo de recuperação. Levamos quase uma hora no telefone, mas a Camila teve toda a paciência do mundo. Ela nunca me apressou e sempre confirmava se eu tinha entendido cada etapa. No final, conseguimos recuperar todos os meus arquivos e o computador voltou a funcionar perfeitamente. A Camila ainda me ensinou a fazer backup automático para evitar esse tipo de susto no futuro. Eu fico muito grata por ter profissionais assim na equipe de vocês. Por favor, reconheçam o trabalho da Camila. Ela é uma profissional excepcional." "160"

echo "[7/8] Sugestao - Melhorias App"
generate_audio "sugestao_melhorias_app.mp3" "Rocko (Portuguese (Brazil))" "Olá, boa tarde. Meu nome é Fernando Santos e eu gostaria de dar algumas sugestões sobre o aplicativo de vocês. Eu uso o app todos os dias e no geral gosto muito, mas acho que tem algumas melhorias que poderiam ser feitas. Primeiro, seria ótimo ter uma opção de modo escuro. Eu costumo usar o app à noite e a tela muito clara incomoda os olhos. Segundo, o processo de pagamento poderia ser mais simples. Hoje em dia tem muitos passos até finalizar uma compra. Se tivesse a opção de salvar o cartão e fazer pagamento com um clique, seria muito mais prático. Terceiro, acho que falta uma função de busca mais inteligente. Quando eu pesquiso um produto, os resultados nem sempre são relevantes. Seria legal ter filtros mais detalhados, por preço, por avaliação, por marca. Quarto, o sistema de notificações precisa melhorar. Recebo muitas notificações que não me interessam e não consigo personalizar. No mais, o app é muito bom. O design é bonito, é rápido e tem bastante variedade de produtos. Espero que essas sugestões sejam úteis para vocês." "170"

echo "[8/8] Reclamacao - Atendimento Ruim"
generate_audio "reclamacao_atendimento_ruim.mp3" "Shelley (Portuguese (Brazil))" "Boa tarde, meu nome é Patrícia Mendes e infelizmente preciso fazer uma reclamação séria. Hoje de manhã eu fui até a loja de vocês no shopping para resolver um problema com o meu aparelho. O atendente que me recebeu foi extremamente mal educado e desrespeitoso. Ele mal me ouviu e já foi dizendo que o problema era minha culpa. Eu tentei explicar a situação com calma, mas ele ficava me interrompendo e revirando os olhos. Quando pedi para falar com o gerente, ele disse que o gerente não estava e que eu voltasse outro dia. Eu fiquei mais de meia hora na loja e saí sem nenhuma resolução para o meu problema. Isso é totalmente inaceitável. Um profissional que trabalha com atendimento ao público precisa ter no mínimo educação e respeito. Exijo que providências sejam tomadas em relação a esse funcionário e que meu problema seja resolvido o mais rápido possível. Aguardo retorno urgente." "170"

echo ""
echo "Done! All audio files generated."
echo ""
ls -lh "$OUTPUT_DIR"
