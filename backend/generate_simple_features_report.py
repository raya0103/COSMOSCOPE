import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        page_w, page_h = A4

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(40, page_h - 32, "COSMOSCOPE · Project Features Overview")
            self.drawRightString(page_w - 40, page_h - 32, "NASA Space Apps Challenge")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(40, page_h - 36, page_w - 40, page_h - 36)

        # Footer (all pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 25, "COSMOSCOPE: Explore the Changing Universe")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(page_w - 40, 25, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(40, 35, page_w - 40, 35)

        self.restoreState()


def create_feature_card(title, tag, description, capabilities, styles, content_width):
    """Creates a clean, styled feature card container"""
    items = []
    
    # Title & Tag row
    header_html = f"<b><font size=12 color='#0F172A'>{title}</font></b> &nbsp;&nbsp; <font size=8 color='#0284C7'><b>[{tag.upper()}]</b></font>"
    items.append(Paragraph(header_html, styles["CardTitle"]))
    items.append(Spacer(1, 4))
    
    # Description
    items.append(Paragraph(description, styles["NormalBody"]))
    items.append(Spacer(1, 6))
    
    # Key Capabilities
    items.append(Paragraph("<b>Key Features & User Capabilities:</b>", styles["BulletHeader"]))
    items.append(Spacer(1, 2))
    for cap in capabilities:
        items.append(Paragraph(f"• {cap}", styles["BulletText"]))
        items.append(Spacer(1, 1))

    # Wrap in Table
    card_table = Table([[items]], colWidths=[content_width])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#E2E8F0")),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    return card_table


def generate_simple_report(output_paths):
    page_w, page_h = A4
    margin = 40
    content_width = page_w - (2 * margin)

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0284C7')
    )

    lead_style = ParagraphStyle(
        'DocLead',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0F172A')
    )

    styles.add(ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    ))

    styles.add(ParagraphStyle(
        'NormalBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    ))

    styles.add(ParagraphStyle(
        'BulletHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    ))

    styles.add(ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#475569')
    ))

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#0F172A')
    )

    table_cell_text = ParagraphStyle(
        'TableCellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#334155')
    )

    story = []

    # ==========================
    # PAGE 1: TITLE & INTRO
    # ==========================
    story.append(Paragraph("COSMOSCOPE", title_style))
    story.append(Paragraph("Explore the Changing Universe - Project Features & Overview", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284C7"), spaceBefore=2, spaceAfter=10))

    intro_p = (
        "<b>COSMOSCOPE</b> is an interactive astronomical exploration and scientific data analysis platform developed "
        "for the <b>NASA Space Apps Challenge</b>. Inspired by NASA's upcoming SPHEREx (Spectro-Photometer for the History "
        "of the Universe, Epoch of Reionization and Ices Explorer) mission, COSMOSCOPE enables students, citizen scientists, "
        "and professional researchers to explore multi-wavelength skies, detect cosmic changes over time, analyze spectral "
        "ice fingerprints, and visualize the three-dimensional cosmic web."
    )
    story.append(Paragraph(intro_p, lead_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Core Platform Features", section_heading))
    story.append(Spacer(1, 6))

    # Feature 1
    f1 = create_feature_card(
        title="1. Interactive Sky & Multi-Wavelength Explorer",
        tag="Exploration Tool",
        description=(
            "An interactive celestial map powered by Aladin Lite and HiPS survey tiles. Users can zoom from wide-field panoramic "
            "sky perspectives down to high-resolution arcsecond targets across the celestial sphere."
        ),
        capabilities=[
            "<b>Multi-Spectral Wavelength Layers:</b> Instantly switch between SPHEREx Near-IR mock data, DSS2 Optical, 2MASS Near-Infrared, WISE Mid-Infrared, and Fermi Gamma-Ray surveys.",
            "<b>Target Search & Presets:</b> Instant navigation to celestial landmarks including Barnard's Star, Crab Nebula, Orion Nebula, Andromeda Galaxy (M31), and Kepler-186f.",
            "<b>Real-Time Coordinate Tracking:</b> Displays dynamic Right Ascension (RA) and Declination (Dec) with celestial reticle targeting and full Field-of-View (FOV) zooming."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f1)
    story.append(Spacer(1, 9))

    # Feature 2
    f2 = create_feature_card(
        title="2. Automated Astronomical Change Detection Engine",
        tag="Scientific Analytics",
        description=(
            "An intelligent algorithmic pipeline that monitors multi-epoch sky observations to detect cosmic events and classify "
            "how astronomical sources change in brightness and position over time."
        ),
        capabilities=[
            "<b>Four Detection Categories:</b> Automatically groups discoveries into Variable Stars (periodic flux shifts), Transient Events (supernovae, flares), High Proper Motion (fast-moving stars), and New Emerging Sources.",
            "<b>Anomaly Evaluation Index (AEI):</b> Computes a unified scientific confidence score (0 to 100) combining signal-to-noise ratio, baseline variance, and multi-epoch consistency.",
            "<b>Category Filters & Sorting:</b> Enables fast triage of candidates by confidence score, classification category, or observation date."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f2)
    story.append(Spacer(1, 9))

    # Feature 3
    f3 = create_feature_card(
        title="3. In-Depth Candidate Investigation Modal",
        tag="Detailed Analysis",
        description=(
            "Clicking 'Investigate' on any detected candidate opens a dedicated laboratory panel displaying verified photometric "
            "light curves, astrometric motion trajectories, and cross-catalogue validations."
        ),
        capabilities=[
            "<b>Multi-Epoch Light Curve:</b> Interactive flux-vs-epoch chart showing brightness variations, error bars, and baseline reference levels.",
            "<b>Astrometric Trajectory Plot:</b> Sky coordinate vector mapping (RA vs Dec) showing angular displacement and proper motion direction across epochs.",
            "<b>External Catalogue Cross-Matching:</b> Automatic correlation against external astronomical archives including Gaia DR3 (astrometry) and AllWISE (infrared colors).",
            "<b>Scientific Caution & False-Positive Checks:</b> Automatic flagging of optical diffraction spikes, satellite trails, and detector edge artifacts."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f3)

    story.append(PageBreak())

    # ==========================
    # PAGE 2: ADVANCED TOOLS & SUMMARY
    # ==========================
    story.append(Paragraph("Advanced Scientific Instruments & Visualizers", section_heading))
    story.append(Spacer(1, 6))

    # Feature 4
    f4 = create_feature_card(
        title="4. Interactive Time-Lapse Blink Comparator",
        tag="Verification Instrument",
        description=(
            "Modeled after the classic astronomical blink microscope used to discover Pluto, this digital comparator allows direct "
            "visual inspection of image cutouts captured at different survey epochs."
        ),
        capabilities=[
            "<b>Blink Animation Mode:</b> Rapidly alternates between Epoch 1 and Epoch 2 with user-adjustable speed (100 ms to 2000 ms) to make moving or fluctuating sources instantly pop out.",
            "<b>Side-by-Side & Split Slider:</b> Interactive curtain slider allowing smooth horizontal wiping between baseline and follow-up images.",
            "<b>Difference Imaging (Epoch 2 - Epoch 1):</b> Pixel-level mathematical subtraction highlighting strictly new flux while eliminating static background stars.",
            "<b>Scientific False-Color Palettes:</b> Real-time colormap switching across Viridis, Inferno, Greys, Plasma, and Magma palettes with synchronized zoom and pan."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f4)
    story.append(Spacer(1, 9))

    # Feature 5
    f5 = create_feature_card(
        title="5. Spectral Energy Distribution (SED) & Ice Line Finder",
        tag="Spectroscopy",
        description=(
            "Analyzes continuous spectrophotometric data across all 6 SPHEREx bands (0.75 to 5.0 microns) to detect the building blocks "
            "of life in interstellar molecular clouds and circumstellar disks."
        ),
        capabilities=[
            "<b>Automated Ice Absorption Detection:</b> Identifies characteristic molecular absorption dips for Water Ice (H<sub>2</sub>O at 3.05 microns), Carbon Dioxide Ice (CO<sub>2</sub> at 4.27 microns), and Carbon Monoxide Ice (CO at 4.67 microns).",
            "<b>Continuum Fitting & Optical Depth (tau):</b> Fits polynomial baseline flux and computes optical depth profiles and molecular column densities (N_ice in molecules/cm<sup>2</sup>).",
            "<b>Interactive Band Filtering:</b> Toggle individual SPHEREx spectral channels (Band 1 through Band 6) with spectral resolution R=40 to R=130."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f5)
    story.append(Spacer(1, 9))

    # Feature 6
    f6 = create_feature_card(
        title="6. 3D Extragalactic Cosmic Web Visualizer",
        tag="3D WebGL Cosmology",
        description=(
            "An interactive 3D cosmological map rendering thousands of galaxies to reveal the large-scale filamentary structure "
            "of the universe as probed by all-sky infrared surveys."
        ),
        capabilities=[
            "<b>Filamentary Cosmic Web Rendering:</b> Visualizes galaxy clusters, cosmic bridges (filaments), and vast cosmic voids in an interactive 3D WebGL space.",
            "<b>Redshift Slicing (z):</b> User-controlled slider isolating galaxy distributions across cosmic epochs from local space (z = 0.0) to distant space (z > 2.0).",
            "<b>Intuitive Navigation:</b> Full 360-degree orbit rotation, smooth zoom, pan, and interactive point inspection."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f6)

    story.append(PageBreak())

    # ==========================
    # PAGE 3: REPORTING & PLATFORM SUMMARY TABLE
    # ==========================
    story.append(Paragraph("Reporting, Education & Platform Capabilities", section_heading))
    story.append(Spacer(1, 6))

    # Feature 7
    f7 = create_feature_card(
        title="7. Scientific Evidence Dossier & Report Generator",
        tag="Publication & Export",
        description=(
            "One-click automated generation of publication-grade Scientific Evidence Dossiers in PDF format, designed for scientific "
            "peer-review, NASA Space Apps evaluation, and classroom presentations."
        ),
        capabilities=[
            "<b>Six-Tier Scientific Data Provenance:</b> Explicitly classifies every candidate from Tier 1 (NASA Verified Calibrated Data) down to Tier 6 (Simulated / Synthetic Injection).",
            "<b>Observation Traceability Ledger:</b> Comprehensive table listing UTC dates, instrument detector IDs, spectral bands, FITS file identifiers, and archive tiers.",
            "<b>Complete User Tutorial Guide:</b> Integrated downloadable tutorial PDF guide right from the landing page and navigation menu."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f7)
    story.append(Spacer(1, 9))

    # Feature 8
    f8 = create_feature_card(
        title="8. Modern Accessible UI & Scientific Aesthetics",
        tag="UI / UX Architecture",
        description=(
            "Designed to meet modern web standards and scientific visualization requirements, ensuring a responsive, accessible, "
            "and beautiful experience on all devices."
        ),
        capabilities=[
            "<b>Dual Theme Architecture:</b> Deep space dark mode by default with seamless toggle to high-contrast clean light mode.",
            "<b>Responsive Layout:</b> Seamlessly adapts across Desktop workstations (1920×1080), laptops, tablets, and smartphones.",
            "<b>Accessibility Compliance:</b> Keyboard accessible navigation, high contrast text ratios, and clear scientific typography."
        ],
        styles=styles,
        content_width=content_width
    )
    story.append(f8)
    story.append(Spacer(1, 14))

    # Summary Matrix Table
    story.append(Paragraph("Feature Summary Matrix", section_heading))
    story.append(Spacer(1, 6))

    matrix_data = [
        [
            Paragraph("Module / Feature", table_header_style),
            Paragraph("Category", table_header_style),
            Paragraph("Primary Scientific Purpose", table_header_style),
            Paragraph("User Interaction", table_header_style),
        ],
        [
            Paragraph("Interactive Sky Explorer", table_cell_bold),
            Paragraph("Observation", table_cell_text),
            Paragraph("Multi-wavelength celestial exploration across optical, IR, gamma", table_cell_text),
            Paragraph("Pan, zoom, layer toggle, target search", table_cell_text),
        ],
        [
            Paragraph("Automated Change Detection", table_cell_bold),
            Paragraph("Time-Domain", table_cell_text),
            Paragraph("Identifies variable stars, transients, proper motion, new sources", table_cell_text),
            Paragraph("Filter, rank by score, inspect alerts", table_cell_text),
        ],
        [
            Paragraph("Source Investigation", table_cell_bold),
            Paragraph("Verification", table_cell_text),
            Paragraph("Multi-epoch light curves, astrometry trajectory, catalog cross-match", table_cell_text),
            Paragraph("Interactive charts, export plot data", table_cell_text),
        ],
        [
            Paragraph("Time-Lapse Blink Comparator", table_cell_bold),
            Paragraph("Imaging", table_cell_text),
            Paragraph("Digital blink microscopy, split wipe, difference imaging (E2 - E1)", table_cell_text),
            Paragraph("Play/pause blink, speed, colormaps", table_cell_text),
        ],
        [
            Paragraph("SED & Ice Line Finder", table_cell_bold),
            Paragraph("Spectroscopy", table_cell_text),
            Paragraph("Detects interstellar water (H2O), CO2, CO ice absorption bands", table_cell_text),
            Paragraph("Wavelength slicing, optical depth calc", table_cell_text),
        ],
        [
            Paragraph("3D Cosmic Web Visualizer", table_cell_bold),
            Paragraph("Cosmology", table_cell_text),
            Paragraph("3D mapping of extragalactic filaments, galaxy clusters, and voids", table_cell_text),
            Paragraph("3D rotate, redshift slice (z=0 to 2)", table_cell_text),
        ],
        [
            Paragraph("Evidence Dossier Exporter", table_cell_bold),
            Paragraph("Documentation", table_cell_text),
            Paragraph("Generates NASA-grade PDF reports with 6-tier data provenance", table_cell_text),
            Paragraph("One-click PDF download & export", table_cell_text),
        ],
    ]

    col_w = [115, 75, 175, 150]
    matrix_table = Table(matrix_data, colWidths=col_w, repeatRows=1)
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(matrix_table)

    import shutil
    primary_path = output_paths[0]
    os.makedirs(os.path.dirname(os.path.abspath(primary_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        primary_path,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin
    )
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated primary: {primary_path} ({os.path.getsize(primary_path)} bytes)")

    for path in output_paths[1:]:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        shutil.copyfile(primary_path, path)
        print(f"Copied to: {path} ({os.path.getsize(path)} bytes)")

if __name__ == '__main__':
    artifact_dir = r"C:\Users\hetvi\.gemini\antigravity\brain\2b08117d-1939-48f8-aeea-91b1ffdbb538"
    out_paths = [
        r"C:\Users\hetvi\Downloads\COSMOSCOPE\COSMOSCOPE_Simple_Features_Report.pdf",
        r"C:\Users\hetvi\Downloads\COSMOSCOPE_Simple_Features_Report.pdf",
        os.path.join(artifact_dir, "COSMOSCOPE_Simple_Features_Report.pdf")
    ]
    generate_simple_report(out_paths)
