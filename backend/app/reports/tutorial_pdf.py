"""
COSMOSCOPE Complete Interactive User Guide & Scientific Tutorial PDF Generator.
Produces a comprehensive, publication-grade A4 tutorial PDF using ReportLab Platypus.
Covers all 16 chapters detailing platform architecture, scientific workflows,
dashboard modules, and data provenance.
"""

import io
import os
import time
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw exact 'Page X of Y' footers
    and professional headers on all pages except the cover page.
    """
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
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress headers/footers on the cover page
            return

        page_w, page_h = A4
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#091124"))

        # Running Header
        self.drawString(36, page_h - 26, "COSMOSCOPE — Explore the Changing Universe")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(page_w - 36, page_h - 26, "Complete Platform User Guide & Tutorial")
        
        # Header Rule
        self.setStrokeColor(colors.HexColor("#0284c7"))
        self.setLineWidth(0.75)
        self.line(36, page_h - 30, page_w - 36, page_h - 30)

        # Footer Rule
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, page_w - 36, 32)

        # Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(36, 20, "NASA Space Apps Challenge · SPHEREx Scientific Exploration Platform · Open Science")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_w - 36, 20, page_str)
        self.restoreState()


def get_tutorial_styles():
    """Builds and returns calibrated typographical styles for the User Guide."""
    styles = getSampleStyleSheet()

    title_cover = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=38,
        textColor=colors.HexColor("#F5F8FF"),
        alignment=TA_CENTER
    )

    subtitle_cover = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=20,
        textColor=colors.HexColor("#36DDF5"),
        alignment=TA_CENTER
    )

    tagline_cover = ParagraphStyle(
        "CoverTagline",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#C4D0E0"),
        alignment=TA_CENTER
    )

    chapter_h1 = ParagraphStyle(
        "ChapterH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#091124"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    section_h2 = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body = ParagraphStyle(
        "TutorialBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        alignment=TA_LEFT,
        spaceAfter=5
    )

    body_bold = ParagraphStyle(
        "TutorialBodyBold",
        parent=body,
        fontName="Helvetica-Bold"
    )

    bullet = ParagraphStyle(
        "TutorialBullet",
        parent=body,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_text = ParagraphStyle(
        "CalloutText",
        parent=body,
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )

    code_text = ParagraphStyle(
        "CodeText",
        parent=body,
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0284c7")
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#ffffff"),
        alignment=TA_CENTER
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#091124")
    )

    return {
        "title_cover": title_cover,
        "subtitle_cover": subtitle_cover,
        "tagline_cover": tagline_cover,
        "chapter_h1": chapter_h1,
        "section_h2": section_h2,
        "body": body,
        "body_bold": body_bold,
        "bullet": bullet,
        "callout_text": callout_text,
        "code_text": code_text,
        "table_header": table_header,
        "table_cell": table_cell,
        "table_cell_bold": table_cell_bold,
    }


def make_callout(text: str, styles: dict, title: str = "SCIENTIFIC NOTE", color_hex: str = "#0284c7") -> Table:
    """Creates a beautifully styled callout card table with left colored accent border."""
    content = [
        Paragraph(f"<b><font color='{color_hex}'>{title}</font></b>", styles["callout_text"]),
        Spacer(1, 2),
        Paragraph(text, styles["callout_text"])
    ]
    t = Table([[content]], colWidths=[520])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('LINELEFT', (0, 0), (0, -1), 3.5, colors.HexColor(color_hex)),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    return t


def generate_tutorial_pdf() -> bytes:
    """
    Compiles the complete 16-chapter COSMOSCOPE user guide into an A4 PDF document.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44,
        pageCompression=0
    )

    styles = get_tutorial_styles()
    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    cover_data = [
        [
            Paragraph("COSMOSCOPE", styles["title_cover"])
        ],
        [
            Spacer(1, 8)
        ],
        [
            Paragraph("EXPLORE THE CHANGING UNIVERSE", styles["subtitle_cover"])
        ],
        [
            Spacer(1, 6)
        ],
        [
            Paragraph("Complete Platform User Guide & Scientific Tutorial · Official Manual", styles["tagline_cover"])
        ],
        [
            Spacer(1, 14)
        ],
        [
            Paragraph(
                "A comprehensive reference manual for students, citizen scientists, and researchers navigating "
                "NASA's SPHEREx all-sky near-infrared spectral survey, multi-epoch celestial variability, "
                "102-band spectroscopy, and cryptographic data provenance.",
                styles["tagline_cover"]
            )
        ]
    ]

    cover_table = Table(cover_data, colWidths=[520])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#071225")),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor("#0284c7")),
        ('TOPPADDING', (0, 0), (-1, -1), 24),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 24),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 20))

    # Metadata Card on Cover
    meta_rows = [
        [
            Paragraph("<b>Document Version:</b>", styles["table_cell_bold"]),
            Paragraph("v2.2.0 (Scientific Validation Release)", styles["table_cell"]),
            Paragraph("<b>Target Mission:</b>", styles["table_cell_bold"]),
            Paragraph("NASA SPHEREx (0.75 – 5.0 µm)", styles["table_cell"]),
        ],
        [
            Paragraph("<b>Publication Date:</b>", styles["table_cell_bold"]),
            Paragraph(time.strftime("%B %Y"), styles["table_cell"]),
            Paragraph("<b>Event / Track:</b>", styles["table_cell_bold"]),
            Paragraph("NASA Space Apps Challenge", styles["table_cell"]),
        ],
        [
            Paragraph("<b>Supported Catalogues:</b>", styles["table_cell_bold"]),
            Paragraph("NASA IRSA, Gaia DR3, AllWISE, SIMBAD", styles["table_cell"]),
            Paragraph("<b>Data Authenticity:</b>", styles["table_cell_bold"]),
            Paragraph("Verified 6-Tier Scientific Provenance", styles["table_cell"]),
        ]
    ]
    meta_table = Table(meta_rows, colWidths=[105, 155, 105, 155])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Executive Overview
    story.append(Paragraph(
        "<b>Welcome to COSMOSCOPE.</b> This manual serves as an end-to-end tutorial to mastering the COSMOSCOPE "
        "exploration environment. Whether you are inspecting the high-velocity proper motion of Barnard's Star, "
        "searching for water-ice absorption bands in brown dwarf WISE 0855, or validating automated change-detection "
        "candidates, every chapter below explains the buttons, mathematical methods, and workflows available in the platform.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # TABLE OF CONTENTS
    toc_data = [
        [Paragraph("TABLE OF CONTENTS", styles["table_header"]), Paragraph("PRIMARY TOPIC", styles["table_header"])],
        [Paragraph("Chapter 1: Introduction to COSMOSCOPE", styles["table_cell_bold"]), Paragraph("Mission context, scientific problem, and core purpose", styles["table_cell"])],
        [Paragraph("Chapter 2: Understanding the Homepage", styles["table_cell_bold"]), Paragraph("Landing page layout, sections, navigation, and entry points", styles["table_cell"])],
        [Paragraph("Chapter 3: Dashboard Overview", styles["table_cell_bold"]), Paragraph("The 9 scientific workbench modules and workflow architecture", styles["table_cell"])],
        [Paragraph("Chapter 4: Sky Explorer", styles["table_cell_bold"]), Paragraph("Object targeting, coordinate search, all-sky maps, and FOV cutouts", styles["table_cell"])],
        [Paragraph("Chapter 5: Cosmic Time Machine", styles["table_cell_bold"]), Paragraph("Multi-epoch player, playback speed, blinking, and comparison modes", styles["table_cell"])],
        [Paragraph("Chapter 6: Spectral Lab", styles["table_cell_bold"]), Paragraph("102-band spectrophotometry, ice indicators, and reading SED graphs", styles["table_cell"])],
        [Paragraph("Chapter 7: Image Analysis Lab", styles["table_cell_bold"]), Paragraph("FITS rendering, stretches, image subtraction, stacking, and photometry", styles["table_cell"])],
        [Paragraph("Chapter 8: Discovery Engine", styles["table_cell_bold"]), Paragraph("Automated change detection, candidate triage, and exploratory caution", styles["table_cell"])],
        [Paragraph("Chapter 9: Multi-Mission Explorer", styles["table_cell_bold"]), Paragraph("Cross-matching SPHEREx with ESA Gaia DR3, NASA AllWISE, and 2MASS", styles["table_cell"])],
        [Paragraph("Chapter 10: Research Library", styles["table_cell_bold"]), Paragraph("Scientific references, mission white papers, and interactive glossaries", styles["table_cell"])],
        [Paragraph("Chapter 11: Scientific Evidence Dossier", styles["table_cell_bold"]), Paragraph("6-tier provenance system, SHA-256 seal, and audit report generation", styles["table_cell"])],
        [Paragraph("Chapter 12: Scientific Analytics", styles["table_cell_bold"]), Paragraph("Statistical radar charts, flux variance, and variability diagnostics", styles["table_cell"])],
        [Paragraph("Chapter 13: Understanding Astronomical Data", styles["table_cell_bold"]), Paragraph("Comprehensive beginner-friendly glossary of astrophysical terms", styles["table_cell"])],
        [Paragraph("Chapter 14: Data Sources & Reliability", styles["table_cell_bold"]), Paragraph("NASA/IPAC IRSA archives, pipelines, and model vs measured transparency", styles["table_cell"])],
        [Paragraph("Chapter 15: Frequently Asked Questions", styles["table_cell_bold"]), Paragraph("Concise answers to common user, mission, and data questions", styles["table_cell"])],
        [Paragraph("Chapter 16: Quick Start Guide", styles["table_cell_bold"]), Paragraph("10-step practical walkthrough: Your First 10 Minutes with COSMOSCOPE", styles["table_cell"])],
    ]
    toc_table = Table(toc_data, colWidths=[200, 320])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#091124")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#0284c7")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(toc_table)

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1 — INTRODUCTION TO COSMOSCOPE
    # =========================================================================
    story.append(Paragraph("Chapter 1 — Introduction to COSMOSCOPE", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>1.1 What is COSMOSCOPE?</b><br/>"
        "COSMOSCOPE is an open-science astronomical exploration and scientific analysis platform built for the "
        "NASA Space Apps Challenge. It provides intuitive, browser-based tools that unlock genuine multi-epoch "
        "infrared observations captured by NASA's revolutionary SPHEREx space telescope.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>1.2 What Scientific Problem Does It Address?</b><br/>"
        "Modern all-sky space telescopes generate petabytes of complex, multi-extension FITS data containing "
        "hundreds of spectral channels and multiple observation dates. Historically, analyzing these multi-dimensional "
        "surveys required specialized astrophysics software, command-line scripts, and large local compute clusters. "
        "COSMOSCOPE removes these technical barriers by providing a responsive, zero-install research workbench "
        "where users can explore the dynamic infrared universe in real time.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>1.3 What is the SPHEREx Mission?</b><br/>"
        "SPHEREx (<i>Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer</i>) "
        "is a NASA Medium-Class Explorer (MIDEX) mission designed to conduct the first-ever all-sky near-infrared "
        "spectrophotometric survey. Operating in a 650 km Sun-synchronous low-Earth polar orbit, SPHEREx maps the "
        "entire celestial sphere every 6 months across <b>102 narrow spectral bands</b> from <b>0.75 µm to 5.0 µm</b>.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>1.4 Why Are Infrared Observations Important?</b><br/>"
        "• <b>Piercing Interstellar Dust:</b> Cosmic dust clouds absorb and scatter visible light, hiding young stars "
        "and galactic centers. Longer infrared wavelengths glide straight through dust grains.<br/>"
        "• <b>Detecting Cold Matter:</b> Low-mass brown dwarfs, planetary atmospheres, and interstellar ices radiate "
        "thermal energy almost exclusively in the infrared.<br/>"
        "• <b>Cosmic Redshift:</b> Light emitted by infant galaxies in the early universe has been stretched into "
        "infrared bands by the cosmic expansion of space over billions of years.",
        styles["body"]
    ))
    story.append(make_callout(
        "COSMOSCOPE connects directly to the NASA/IPAC Infrared Science Archive (IRSA) and incorporates an "
        "offline-resilient caching architecture to guarantee 100% operational reliability during evaluations.",
        styles,
        title="CORE ARCHITECTURE PRINCIPLE"
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 2 — UNDERSTANDING THE HOMEPAGE
    # =========================================================================
    story.append(Paragraph("Chapter 2 — Understanding the Homepage", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "The COSMOSCOPE landing page is organized into a cohesive, space-themed visual narrative. "
        "Here is what each section provides:",
        styles["body"]
    ))
    story.append(Paragraph(
        "• <b>Navigation Bar:</b> Fixed at the top with quick links to <i>About</i>, <i>Science</i>, <i>How It Works</i>, "
        "<i>Tutorial Guide</i>, <i>Discoveries</i>, <i>Data Sources</i>, <i>FAQ</i>, the Dark/Light theme toggle, and the "
        "primary <b>Explore Dashboard</b> launch button.<br/>"
        "• <b>Hero Section:</b> Displays live telescope telemetry metrics (102 Spectral Bands, 0.75–5.0 µm, 6 Linear Variable "
        "Filter Detectors, and 3,885+ Observation Cutouts), with instant search by object name or coordinates.<br/>"
        "• <b>Why Observing the Changing Universe Matters:</b> Explains temporal astrophysics, stellar variability, and orbital mechanics.<br/>"
        "• <b>How It Works (Three Stages):</b> Outlines the 3-step pipeline: <i>01 — EXPLORE</i> (archive data ingestion), "
        "<i>02 — ANALYZE</i> (photometry & spectroscopy), and <i>03 — DISCOVER</i> (anomaly detection). Immediately below sits the "
        "<b>Tutorial Guide</b> section with direct PDF downloads.<br/>"
        "• <b>Five Verified Research Targets:</b> Interactive tabbed dossiers showcasing Barnard's Star, Epsilon Indi B, WISE 0855, "
        "RW Aurigae, and R Draconis.<br/>"
        "• <b>Interactive FAQ:</b> 28 categorized accordion questions with keyword search.<br/>"
        "• <b>Footer:</b> Contains external NASA IRSA, ESA Gaia, and GitHub project references.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 3 — DASHBOARD OVERVIEW
    # =========================================================================
    story.append(Paragraph("Chapter 3 — Dashboard Overview & Scientific Workbench", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "Access the dashboard by clicking <b>'Explore Dashboard'</b> in the top navigation bar or visiting "
        "<code>/explorer</code>. The dashboard provides nine specialized environments:",
        styles["body"]
    ))

    dash_modules = [
        [Paragraph("MODULE", styles["table_header"]), Paragraph("ROUTE", styles["table_header"]), Paragraph("CORE CAPABILITIES", styles["table_header"])],
        [Paragraph("Sky Explorer", styles["table_cell_bold"]), Paragraph("/explorer", styles["code_text"]), Paragraph("Pan/zoom all-sky galaxy map, search targets by RA/Dec, load authentic SPHEREx FITS cutouts.", styles["table_cell"])],
        [Paragraph("Cosmic Time Machine", styles["table_cell_bold"]), Paragraph("/time-machine", styles["code_text"]), Paragraph("Play multi-epoch time-lapses, variable-rate blinking, split-screen comparison, and image subtraction.", styles["table_cell"])],
        [Paragraph("Spectral Lab", styles["table_cell_bold"]), Paragraph("/spectral-lab", styles["code_text"]), Paragraph("102-channel spectrophotometry, diagnostic ice absorption markers (H2O, CO2, CO, CH4).", styles["table_cell"])],
        [Paragraph("Image Analysis Lab", styles["table_cell_bold"]), Paragraph("/image-lab", styles["code_text"]), Paragraph("FITS contrast stretches (Log, Asinh, ZScale), flux-matched subtraction, aperture photometry.", styles["table_cell"])],
        [Paragraph("Discovery Engine", styles["table_cell_bold"]), Paragraph("/discovery", styles["code_text"]), Paragraph("Automated change-detection pipeline flagging moving objects, variables, and detector artifacts.", styles["table_cell"])],
        [Paragraph("Scientific Analytics", styles["table_cell_bold"]), Paragraph("/analytics", styles["code_text"]), Paragraph("Multi-Parameter Anomaly Radar charts, flux distributions, and variability statistics.", styles["table_cell"])],
        [Paragraph("Multi-Mission Explorer", styles["table_cell_bold"]), Paragraph("/multi-mission", styles["code_text"]), Paragraph("Cross-match SPHEREx sources with ESA Gaia DR3 astrometry and NASA AllWISE mid-IR colors.", styles["table_cell"])],
        [Paragraph("Research Library", styles["table_cell_bold"]), Paragraph("/research", styles["code_text"]), Paragraph("Curated peer-reviewed publications, instrument specifications, and interactive glossaries.", styles["table_cell"])],
        [Paragraph("Evidence Dossier", styles["table_cell_bold"]), Paragraph("/dossier", styles["code_text"]), Paragraph("Comprehensive target synthesis, 6-tier provenance system, SHA-256 seal, and PDF reports.", styles["table_cell"])],
    ]
    t_dash = Table(dash_modules, colWidths=[110, 80, 330])
    t_dash.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#091124")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#0284c7")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_dash)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 4 — SKY EXPLORER
    # =========================================================================
    story.append(Paragraph("Chapter 4 — Sky Explorer", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>4.1 How to Search for Celestial Objects:</b><br/>"
        "• <b>By Object Name:</b> Type common designations such as <code>Barnard's Star</code>, <code>RW Aurigae</code>, "
        "or <code>WISE 0855</code> into the search box. COSMOSCOPE resolves the coordinates automatically.<br/>"
        "• <b>By Equatorial Coordinates:</b> Enter Right Ascension (RA) and Declination (Dec) in decimal degrees "
        "(e.g., <code>RA: 269.452, Dec: 4.693</code>) or sexagesimal notation (<code>17h 57m 48.5s +04d 41m 36s</code>).",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>4.2 Using the All-Sky Galaxy Map:</b><br/>"
        "Powered by Aladin Lite and Astropy WCS routines, the map lets you zoom from an all-sky perspective (30° FOV) "
        "down to fine resolution (10 arcminutes). Toggle between survey layers:<br/>"
        "• <b>DSS2:</b> Optical baseline showing visible stars and galactic structures.<br/>"
        "• <b>2MASS:</b> Near-infrared (J, H, Ks bands) penetrating moderate dust clouds.<br/>"
        "• <b>AllWISE:</b> Mid-infrared (3.4 – 22 µm) revealing thermal dust emission and cold brown dwarfs.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>4.3 Loading SPHEREx Cutouts:</b><br/>"
        "Clicking any target icon loads authentic Level-2 Multi-Extension FITS cutouts from NASA archives. "
        "The observation metadata drawer displays the UTC observation timestamp, MJD date, SPHEREx detector "
        "(D1 through D6), and native flux units (MegaJanskys per steradian).",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 5 — COSMIC TIME MACHINE
    # =========================================================================
    story.append(Paragraph("Chapter 5 — Cosmic Time Machine", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>5.1 Understanding Observation Epochs:</b><br/>"
        "An astronomical epoch is the exact time a telescope exposure occurred. SPHEREx visits every patch of sky "
        "multiple times across its multi-year operational lifetime. Comparing epochs reveals what is moving or changing.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>5.2 Player Controls:</b><br/>"
        "• <b>Play / Pause:</b> Starts or pauses continuous time-lapse playback across the historical sequence.<br/>"
        "• <b>Previous / Next:</b> Steps frame-by-frame through individual observation epochs.<br/>"
        "• <b>Timeline Slider:</b> Jump directly to any recorded observation date.<br/>"
        "• <b>Playback Speed (0.5× – 3.0×):</b> Dynamically speeds up or slows down playback without reloading data.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>5.3 Five Powerful Comparison Modes:</b><br/>"
        "1. <b>Single Frame:</b> Inspect individual calibrated FITS exposures in high resolution.<br/>"
        "2. <b>Side-by-Side:</b> Place two distinct epochs side-by-side with synchronized zoom and pan.<br/>"
        "3. <b>Split Slider:</b> Interactive before/after split curtain slider to reveal subtle shifts.<br/>"
        "4. <b>Image Subtraction:</b> Computes flux-matched difference (I₂ − αI₁), making non-changing stars "
        "disappear completely and leaving moving or variable objects brightly illuminated.<br/>"
        "5. <b>Co-Addition (Stacking):</b> Stacks multi-epoch frames to reduce noise and enhance faint targets.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>5.4 Variable-Frequency Blinking:</b><br/>"
        "Toggle the <b>Blink</b> mode to rapidly alternate between Epoch 1 and Epoch 2 (at 0.5 to 3.0 Hz). "
        "The human visual cortex instantly spots motion (e.g. Barnard's Star jumping across pixels) or flaring.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 6 — SPECTRAL LAB
    # =========================================================================
    story.append(Paragraph("Chapter 6 — Spectral Lab & 102-Band Spectrophotometry", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>6.1 The 102-Band SPHEREx Concept:</b><br/>"
        "SPHEREx utilizes six 2048×2048 detector arrays equipped with Linear Variable Filters (LVF). As the telescope "
        "scans, each star is observed across 102 narrow spectral channels spanning 0.75 µm to 5.0 µm. This produces "
        "a complete Spectral Energy Distribution (SED) for every point in the sky.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>6.2 Reading Spectral Graphs:</b><br/>"
        "• <b>Horizontal Axis (Wavelength, µm):</b> Shows infrared channels from 0.75 µm to 5.0 µm.<br/>"
        "• <b>Vertical Axis (Flux Density, µJy or Normalized Flux):</b> Shows measured energy intensity. "
        "Absorption features appear as pronounced downward troughs where cold gas or ice absorbs light.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>6.3 Diagnostic Chemical & Molecular Ice Markers:</b><br/>"
        "• <b>Water-Ice (H₂O):</b> Deep absorption feature at <b>3.05 µm</b> indicating frozen grains in protoplanetary disks.<br/>"
        "• <b>Carbon Dioxide (CO₂):</b> Sharp molecular absorption dip at <b>4.27 µm</b>.<br/>"
        "• <b>Carbon Monoxide (CO):</b> Characteristic band at <b>4.67 µm</b> in cold interstellar environments.<br/>"
        "• <b>Methane (CH₄):</b> Absorption troughs at <b>1.67 µm and 3.3 µm</b> indicative of cool brown dwarf atmospheres.",
        styles["body"]
    ))
    story.append(make_callout(
        "In the Spectral Lab, authentic channel observations are badged as <b>[MEASURED]</b>. Gaps where detector "
        "coverage is transitioning are labelled as <b>[INTERPOLATED]</b> continuum to prevent scientific misrepresentation.",
        styles,
        title="DATA CLASSIFICATION TRANSPARENCY"
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 7 — IMAGE ANALYSIS LAB
    # =========================================================================
    story.append(Paragraph("Chapter 7 — Image Analysis Lab", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>7.1 FITS Processing & Astronomical Stretches:</b><br/>"
        "Astronomical images have immense dynamic range—a bright star can be 100,000 times brighter than the background. "
        "To reveal faint details without saturating bright pixels, the Image Analysis Lab supports five stretches:<br/>"
        "• <b>Linear:</b> Direct scaling, best for uniform bright fields.<br/>"
        "• <b>Logarithmic:</b> Compresses high-flux cores to reveal faint outer nebular structures.<br/>"
        "• <b>Asinh (Inverse Hyperbolic Sine):</b> Smoothly transitions from linear at the noise floor to logarithmic "
        "at high intensities, preserving stellar profiles without blowing out cores.<br/>"
        "• <b>Square Root:</b> Balanced compression commonly used in optical astronomy.<br/>"
        "• <b>ZScale (IRAF Standard):</b> Automatically samples pixel variance to optimize contrast around the sky noise floor.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>7.2 False-Color Astronomical Colormaps:</b><br/>"
        "Select between <i>Inferno</i>, <i>Magma</i>, <i>Viridis</i>, <i>Cividis</i> (perceptually uniform & colorblind-safe), "
        "and inverted greyscale.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>7.3 Synthetic Aperture Photometry:</b><br/>"
        "Place a calibrated circular aperture over any star and specify an outer sky annulus. The engine computes:<br/>"
        "<code>Net Flux = Total Aperture Flux − (Area × Median Sky Background)</code><br/>"
        "Calibrated instrumental fluxes are converted into standard astronomical AB magnitudes with ±1σ statistical uncertainties.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 8 — DISCOVERY ENGINE
    # =========================================================================
    story.append(Paragraph("Chapter 8 — Discovery Engine & Automated Astronomical Change Detection", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>8.1 Automated Detection Pipeline:</b><br/>"
        "The Discovery Engine applies Astropy WCS reprojection, background sigma clipping, and multi-threshold peak extraction "
        "to search for transient celestial phenomena across observation epochs.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>8.2 Candidate Classifications:</b><br/>"
        "• <b>Candidate Moving Objects:</b> Stars with high proper motion or potential solar system bodies showing significant astrometric displacement.<br/>"
        "• <b>Variable Sources:</b> Stars exhibiting notable flux changes (>0.3 magnitude variation), such as eruptive Young Stellar Objects or pulsating red giants.<br/>"
        "• <b>Known Asteroids:</b> Positional matches with minor planet ephemerides.<br/>"
        "• <b>Artifacts and Glitches:</b> Single-epoch cosmic ray hits, bad pixels, or optical diffraction spikes filtered out by multi-epoch consistency checks.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>8.3 Candidate Triage Queue & Source Investigation Modal:</b><br/>"
        "Clicking <b>'Inspect Candidate'</b> opens the investigation modal, presenting multi-epoch thumbnail stamps, "
        "proper motion displacement curves, and cross-match catalogue details. Users can annotate findings and export "
        "candidate ledgers as CSV files.",
        styles["body"]
    ))
    story.append(make_callout(
        "CRITICAL SCIENTIFIC PRINCIPLE: All automated detections are strictly designated as <b>EXPLORATORY CANDIDATES</b>. "
        "They represent statistical anomalies requiring multi-mission verification and should never be assumed to be confirmed discoveries.",
        styles,
        title="SCIENTIFIC CAUTION & CANDIDATE TRIAGE",
        color_hex="#d97706"
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 9 — MULTI-MISSION EXPLORER
    # =========================================================================
    story.append(Paragraph("Chapter 9 — Multi-Mission Explorer", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>9.1 Cross-Matching SPHEREx with Global Catalogues:</b><br/>"
        "Astronomical objects look completely different across wavelengths. The Multi-Mission Explorer queries external "
        "catalogues within a 3.0 arcsecond cone search to provide multi-wavelength context:<br/>"
        "• <b>ESA Gaia DR3:</b> Provides ultra-precise optical astrometry, proper motion vectors (µ_α cos δ, µ_δ), "
        "geometric parallaxes (distances), and G/BP/RP magnitudes.<br/>"
        "• <b>NASA AllWISE:</b> Provides mid-infrared photometry in W1 (3.4 µm), W2 (4.6 µm), W3 (12 µm), and W4 (22 µm) "
        "to check for warm circumstellar dust or planetary atmospheres.<br/>"
        "• <b>2MASS:</b> Near-infrared baseline (J, H, Ks) from 1997–2001, providing a 25-year time baseline for proper motion.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>9.2 Scientific Value of Multi-Mission Data:</b><br/>"
        "If a detected brightness change in SPHEREx is corroborated by a matching infrared excess in AllWISE and an optical "
        "variability flag in Gaia DR3, astronomers can confidently confirm a genuine astrophysical event rather than an "
        "instrumental anomaly.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 10 — RESEARCH LIBRARY
    # =========================================================================
    story.append(Paragraph("Chapter 10 — Research Library", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "The Research Library (<code>/research</code>) is an educational and documentation center integrated into the platform:<br/>"
        "• <b>Mission Documentation:</b> Direct links to NASA/IPAC IRSA SPHEREx release notes, instrument papers, and detector calibration handbooks.<br/>"
        "• <b>Interactive Terminology Glossary:</b> Clear definitions for essential concepts like WCS, LVF, Point Spread Function (PSF), "
        "Signal-to-Noise Ratio (SNR), and AB Magnitudes.<br/>"
        "• <b>API Reference:</b> Documentation for querying COSMOSCOPE REST endpoints and integrating data into Python research workflows.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 11 — SCIENTIFIC EVIDENCE DOSSIER
    # =========================================================================
    story.append(Paragraph("Chapter 11 — Scientific Evidence Dossier & Provenance System", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "The Scientific Evidence Dossier (<code>/dossier</code>) generates comprehensive target investigation reports "
        "with cryptographic provenance verification. Every displayed scientific metric is assigned to one of six transparent tiers:",
        styles["body"]
    ))

    provenance_table_data = [
        [Paragraph("TIER", styles["table_header"]), Paragraph("CLASSIFICATION", styles["table_header"]), Paragraph("DEFINITION & APPLICATION", styles["table_header"])],
        [Paragraph("Tier 1", styles["table_cell_bold"]), Paragraph("<font color='#0284c7'><b>MEASURED</b></font>", styles["table_cell"]), Paragraph("Direct detector counts, calibrated surface brightness (MJy/sr), and UTC timestamps from authentic FITS cutouts.", styles["table_cell"])],
        [Paragraph("Tier 2", styles["table_cell_bold"]), Paragraph("<font color='#0369a1'><b>CATALOGUED</b></font>", styles["table_cell"]), Paragraph("Retrieved from external vetted astronomical archives (Gaia DR3 astrometry, AllWISE photometry, SIMBAD).", styles["table_cell"])],
        [Paragraph("Tier 3", styles["table_cell_bold"]), Paragraph("<font color='#059669'><b>CALCULATED</b></font>", styles["table_cell"]), Paragraph("Derived mathematically from measured data (aperture photometry, centroid coordinates, noise MAD, displacement).", styles["table_cell"])],
        [Paragraph("Tier 4", styles["table_cell_bold"]), Paragraph("<font color='#7c3aed'><b>INTERPOLATED</b></font>", styles["table_cell"]), Paragraph("Numerically estimated continuum values between observed channels across spectral dispersion gaps.", styles["table_cell"])],
        [Paragraph("Tier 5", styles["table_cell_bold"]), Paragraph("<font color='#d97706'><b>SIMULATED</b></font>", styles["table_cell"]), Paragraph("Theoretical models (e.g. 24-epoch Mira pulsation baselines or simulated Keplerian orbit trajectories).", styles["table_cell"])],
        [Paragraph("Tier 6", styles["table_cell_bold"]), Paragraph("<font color='#e11d48'><b>UNAVAILABLE</b></font>", styles["table_cell"]), Paragraph("Explicitly marked when no reliable astronomical data currently exists in the archive, preventing false guesses.", styles["table_cell"])],
    ]
    t_prov = Table(provenance_table_data, colWidths=[60, 110, 350])
    t_prov.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#091124")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#0284c7")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_prov)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Evidence Passport PDF Export:</b><br/>"
        "Clicking <b>'Download Evidence Passport'</b> generates a cryptographically sealed PDF report. "
        "A SHA-256 seal (e.g., <code>SPX-DOSSIER-B422BC5ED42B92EA</code>) certifies all observation ledgers, "
        "aperture calculations, and catalogue matches for formal peer review.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 12 — SCIENTIFIC ANALYTICS
    # =========================================================================
    story.append(Paragraph("Chapter 12 — Scientific Analytics", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "The Analytics dashboard (<code>/analytics</code>) provides statistical visualizations powered by Plotly.js:<br/>"
        "• <b>Multi-Parameter Anomaly Radar:</b> Plots a four-dimensional radar evaluating: "
        "<i>Proper Motion Velocity</i> (mas/yr), <i>Flux Variability Amplitude</i> (%), <i>3.05 µm Ice Optical Depth (τ)</i>, "
        "and <i>Spectral Novelty</i>.<br/>"
        "• <b>Interpreting Radar Shapes:</b><br/>"
        "  - Stars protruding in the <i>Motion</i> axis: Nearby kinematic stars (e.g., Barnard's Star).<br/>"
        "  - Stars protruding in the <i>Variability</i> axis: Pulsating giants or erupting YSOs (e.g., R Draconis).<br/>"
        "  - Targets protruding in the <i>Ice Depth</i> axis: Cold objects with water-ice envelopes (e.g., WISE 0855).<br/>"
        "• <b>Flux Variance Distribution:</b> Compares measured epoch brightness against expected instrument noise floors.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 13 — UNDERSTANDING ASTRONOMICAL DATA (GLOSSARY)
    # =========================================================================
    story.append(Paragraph("Chapter 13 — Understanding Astronomical Data (Glossary)", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    glossary_terms = [
        ("Right Ascension (RA, α)", "The celestial equivalent of longitude, measuring angular distance eastward along the celestial equator from the vernal equinox (0° to 360° or 0h to 24h)."),
        ("Declination (Dec, δ)", "The celestial equivalent of latitude, measuring angular distance north (+0° to +90°) or south (-0° to -90°) from the celestial equator."),
        ("Field of View (FOV)", "The angular size of the sky visible through the detector, measured in degrees (°), arcminutes (′), or arcseconds (″). 1° = 60 arcmin = 3600 arcsec."),
        ("FITS File", "Flexible Image Transport System: the global standard digital format for astronomical pixel matrices and WCS coordinate headers."),
        ("Observation Epoch", "The precise timestamp (UTC / MJD) when an astronomical exposure was captured by the space telescope."),
        ("Infrared Wavelength", "Light with wavelengths longer than visible red (0.75 µm to 1000 µm), optimal for seeing through cosmic dust and observing cool objects."),
        ("Spectral Band", "A discrete wavelength window measured by an optical filter. SPHEREx records 102 continuous narrow bands."),
        ("Flux Density (µJy)", "The rate of energy transfer per unit area per unit frequency. 1 Jansky (Jy) = 10⁻²⁶ W·m⁻²·Hz⁻¹."),
        ("AB Magnitude", "A logarithmic brightness scale. Brighter objects have smaller or negative magnitudes; each step of 5 magnitudes equals a 100× flux ratio."),
        ("Proper Motion (mas/yr)", "The apparent angular motion of a star across the celestial sphere caused by its real velocity through our galaxy relative to the Sun."),
        ("Aperture Photometry", "Measuring total light within a circular radius and subtracting the median background sky to calculate true source flux."),
        ("Signal-to-Noise Ratio (SNR)", "The ratio of source signal to background noise. Values above 5 indicate confident detections; above 10 indicate precision measurements."),
        ("World Coordinate System (WCS)", "Mathematical transformation matrices embedded in FITS headers converting (X, Y) pixel coordinates into real-world sky coordinates (RA, Dec)."),
        ("Image Subtraction", "Subtracting a normalized reference image from a science exposure (I₂ − αI₁) to isolate moving objects and variable transients."),
    ]

    gloss_data = [[Paragraph("TERM", styles["table_header"]), Paragraph("BEGINNER-FRIENDLY SCIENTIFIC DEFINITION", styles["table_header"])]]
    for term, defn in glossary_terms:
        gloss_data.append([
            Paragraph(term, styles["table_cell_bold"]),
            Paragraph(defn, styles["table_cell"])
        ])

    t_gloss = Table(gloss_data, colWidths=[140, 380])
    t_gloss.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#091124")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#0284c7")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_gloss)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 14 — DATA SOURCES & SCIENTIFIC RELIABILITY
    # =========================================================================
    story.append(Paragraph("Chapter 14 — Data Sources and Scientific Reliability", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    story.append(Paragraph(
        "<b>14.1 Integrated Astronomical Archives:</b><br/>"
        "• <b>NASA/IPAC Infrared Science Archive (IRSA):</b> Host for SPHEREx Quick Release and Level-2 MEF FITS cutouts.<br/>"
        "• <b>ESA Gaia Data Release 3 (DR3):</b> High-precision space astrometry and proper motion vectors.<br/>"
        "• <b>NASA AllWISE & 2MASS:</b> Multi-epoch mid- and near-infrared reference photometry.<br/>"
        "• <b>CDS SIMBAD:</b> Strasbourg Astronomical Data Center cross-identifications and bibliography.",
        styles["body"]
    ))
    story.append(Paragraph(
        "<b>14.2 Reliability & Limitations:</b><br/>"
        "All measurements adhere to peer-reviewed astronomical pipelines. However, users should understand:<br/>"
        "1. Single-epoch detections must not be declared as permanent discoveries without multi-epoch confirmation.<br/>"
        "2. Optical diffraction spikes and cosmic rays can trigger false-positive candidate flags.<br/>"
        "3. Modelled light curves (such as 24-epoch Mira cycles) represent theoretical baselines and are never labeled as direct telescope exposures.",
        styles["body"]
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 15 — FREQUENTLY ASKED QUESTIONS
    # =========================================================================
    story.append(Paragraph("Chapter 15 — Frequently Asked Questions", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    faq_items = [
        ("Are the astronomical observations in COSMOSCOPE real?", "Yes. All FITS images originate directly from authentic NASA/IPAC IRSA SPHEREx Quick Release collections with calibrated WCS headers."),
        ("Do I need an astrophysics degree to use COSMOSCOPE?", "No! COSMOSCOPE is designed for students, amateur astronomers, and professional scientists alike. Interactive visual controls make complex infrared astronomy accessible to everyone."),
        ("How does SPHEREx compare to the James Webb Space Telescope (JWST)?", "SPHEREx is a wide-angle all-sky census telescope mapping 100% of the sky every 6 months to discover interesting targets. JWST is a narrow-field pointed observatory with a 6.5-meter mirror built for ultra-deep inspections."),
        ("How does offline caching work during judging?", "COSMOSCOPE includes a deterministic local FITS and JSON cache layer. If external NASA APIs experience rate limits, the platform switches seamlessly to local archives with zero downtime."),
        ("How do I report or document a candidate discovery?", "Use the Source Investigation Modal in the Discovery Engine, annotate notes, and export a cryptographically sealed Evidence Passport PDF from the Evidence Dossier."),
    ]

    for q, a in faq_items:
        story.append(Paragraph(f"<b>Q: {q}</b>", styles["section_h2"]))
        story.append(Paragraph(a, styles["body"]))
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 16 — QUICK START GUIDE
    # =========================================================================
    story.append(Paragraph("Chapter 16 — Quick Start Guide: Your First 10 Minutes with COSMOSCOPE", styles["chapter_h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceAfter=8))
    
    steps = [
        ("Step 1: Launch Dashboard", "Navigate to <b>COSMOSCOPE</b> and click <b>'Explore Dashboard'</b> in the top navigation bar."),
        ("Step 2: Select a Research Target", "In Sky Explorer, click <b>'Barnard's Star'</b> or type its name into the search bar to center the coordinates (RA: 269.452°, Dec: +4.693°)."),
        ("Step 3: Explore the All-Sky Map", "Zoom in and out on the All-Sky Galaxy Map. Toggle between DSS2 optical and AllWISE infrared layers to observe dust penetration."),
        ("Step 4: Open SPHEREx FITS Cutout", "Click <b>'Load Cutout'</b> to inspect the authentic Level-2 SPHEREx FITS image in Detector D3."),
        ("Step 5: Launch the Cosmic Time Machine", "Switch to the <b>Time Machine</b> tab. Click <b>Play</b> to watch observations taken across different survey dates."),
        ("Step 6: Toggle Blinking Mode", "Enable the <b>Blink</b> comparator mode. Observe Barnard's Star jumping across pixels due to its 10.36″/year proper motion!"),
        ("Step 7: Inspect 102-Band Spectrum", "Open the <b>Spectral Lab</b>. Examine the 0.75–5.0 µm flux distribution and note characteristic atmospheric features."),
        ("Step 8: Run Automated Change Detection", "Navigate to the <b>Discovery Engine</b>. Review candidate anomalies flagged across epochs, noting SNR and displacement values."),
        ("Step 9: Cross-Match with Gaia DR3", "In the <b>Multi-Mission Explorer</b>, verify the 10,359 mas/yr proper motion vector retrieved from ESA's Gaia DR3 catalogue."),
        ("Step 10: Export Evidence Passport PDF", "Navigate to the <b>Evidence Dossier</b> and click <b>'Download Evidence Passport'</b> to generate a tamper-proof SHA-256 PDF report documenting your investigation!"),
    ]

    for title, desc in steps:
        story.append(Paragraph(f"<b>{title}</b> — {desc}", styles["bullet"]))
    story.append(Spacer(1, 14))

    # Closing Sign-off
    story.append(Paragraph(
        "<i>Congratulations! You have completed the COSMOSCOPE walkthrough and are ready to explore the changing infrared universe. "
        "For additional information, consult the Research Library or visit the official NASA SPHEREx mission documentation at NASA/IPAC IRSA.</i>",
        styles["body"]
    ))

    # Build the document using the custom two-pass canvas
    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.read()


if __name__ == "__main__":
    # Test script generation
    pdf_bytes = generate_tutorial_pdf()
    out_path = "COSMOSCOPE_Complete_User_Guide.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)
    print(f"Generated {out_path} ({len(pdf_bytes)} bytes)")
