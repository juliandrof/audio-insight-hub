import io
import datetime
from fpdf import FPDF


class AudioReportPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(99, 102, 241)
        self.cell(0, 8, "Audio Insight Hub", new_x="LMARGIN", new_y="NEXT", align="L")
        self.set_draw_color(99, 102, 241)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Gerado em {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}", align="L")
        self.cell(0, 10, f"Pagina {self.page_no()}/{{nb}}", align="R")


def generate_analysis_pdf(analysis: dict) -> bytes:
    """Generate a PDF report for a single audio analysis."""
    pdf = AudioReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 12, "Relatorio de Analise de Audio", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # File info box
    pdf.set_fill_color(245, 245, 255)
    pdf.set_draw_color(99, 102, 241)
    pdf.rect(10, pdf.get_y(), 190, 28, style="DF")

    y_start = pdf.get_y() + 3
    pdf.set_xy(15, y_start)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(40, 6, "Arquivo:")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, str(analysis.get("file_name", "N/A")), new_x="LMARGIN", new_y="NEXT")

    pdf.set_x(15)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(40, 6, "Categoria:")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(50, 6, str(analysis.get("category", "N/A")))
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(30, 6, "Sentimento:")
    pdf.set_font("Helvetica", "", 10)

    sentiment = analysis.get("sentiment", "N/A")
    sentiment_colors = {
        "positive": (34, 197, 94), "negative": (239, 68, 68), "neutral": (156, 163, 175)
    }
    color = sentiment_colors.get(sentiment, (100, 100, 100))
    pdf.set_text_color(*color)
    pdf.cell(0, 6, sentiment.upper(), new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(60, 60, 60)

    pdf.set_x(15)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(40, 6, "Urgencia:")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(50, 6, str(analysis.get("urgency_level", "normal")).upper())
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(30, 6, "Idioma:")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, str(analysis.get("language_detected", "N/A")).upper(), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(8)

    # Summary section
    _add_section(pdf, "Resumo", analysis.get("summary", "Sem resumo disponivel."))

    # Key Topics
    topics = analysis.get("key_topics", [])
    if topics:
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(0, 10, "Topicos Principais", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(60, 60, 60)
        for topic in topics:
            pdf.cell(5, 6, "")
            pdf.cell(0, 6, f"  * {topic}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

    # Action Items
    actions = analysis.get("action_items", [])
    if actions:
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(0, 10, "Itens de Acao", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(60, 60, 60)
        for i, action in enumerate(actions, 1):
            pdf.cell(5, 6, "")
            pdf.cell(0, 6, f"  {i}. {action}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

    # Detailed report if available
    detailed = analysis.get("detailed_report", "")
    if detailed:
        _add_section(pdf, "Relatorio Detalhado", detailed)

    # Transcription
    _add_section(pdf, "Transcricao Completa", analysis.get("transcription", "Sem transcricao."))

    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


def generate_batch_pdf(analyses: list) -> bytes:
    """Generate a PDF report for multiple audio analyses."""
    pdf = AudioReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 14, "Relatorio Consolidado de Analises", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, f"Total de audios analisados: {len(analyses)}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(
        0, 6,
        f"Data de geracao: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}",
        new_x="LMARGIN", new_y="NEXT",
    )
    pdf.ln(6)

    # Summary stats
    sentiments = [a.get("sentiment", "neutral") for a in analyses]
    categories = {}
    for a in analyses:
        cat = a.get("category", "Sem categoria")
        categories[cat] = categories.get(cat, 0) + 1

    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, "Estatisticas Gerais", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 6, f"  Positivos: {sentiments.count('positive')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"  Negativos: {sentiments.count('negative')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"  Neutros: {sentiments.count('neutral')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Distribuicao por Categoria:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        pdf.cell(0, 6, f"  {cat}: {count}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Individual analyses
    for i, a in enumerate(analyses, 1):
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(0, 10, f"Audio {i}: {a.get('file_name', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(30, 6, "Categoria: ")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 6, str(a.get("category", "N/A")), new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(30, 6, "Sentimento: ")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 6, str(a.get("sentiment", "N/A")).upper(), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

        _add_section(pdf, "Resumo", a.get("summary", "N/A"))
        _add_section(pdf, "Transcricao", a.get("transcription", "N/A"))

    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


def _add_section(pdf, title, content):
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(60, 60, 60)
    # Handle encoding for special characters
    safe_content = content.encode("latin-1", "replace").decode("latin-1") if content else ""
    pdf.multi_cell(0, 5, safe_content)
    pdf.ln(4)
