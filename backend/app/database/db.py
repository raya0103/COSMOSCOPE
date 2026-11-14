"""
Database Layer for SPHEREx EXPLORER.
Provides persistence for Citizen Science reviews, anomaly candidates, and investigations.
Supports zero-config SQLite by default and MySQL for production.
"""
import os
import sqlite3
import time
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
os.makedirs(DB_DIR, exist_ok=True)
SQLITE_PATH = os.path.join(DB_DIR, "spherex.db")

def get_connection():
    """Returns a SQLite connection with row dictionary factory."""
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

_initialized = False

def ensure_db():
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True


def init_db():
    """Initializes tables and seeds default NASA challenge candidates."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Candidates Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id TEXT PRIMARY KEY,
            target_name TEXT,
            ra_deg REAL NOT NULL,
            dec_deg REAL NOT NULL,
            anomaly_score REAL NOT NULL,
            classification_tier TEXT NOT NULL,
            badge TEXT,
            proper_motion_mas_yr REAL,
            variability_amplitude REAL,
            reasons_json TEXT,
            created_at_utc TEXT
        )
        """)
        
        # 2. Citizen Science Classifications Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS citizen_classifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id TEXT NOT NULL,
            user_identifier TEXT DEFAULT 'anonymous_citizen',
            is_real_motion INTEGER NOT NULL,
            motion_direction TEXT,
            is_variable_brightness INTEGER NOT NULL,
            is_image_artifact INTEGER NOT NULL,
            artifact_type TEXT,
            confidence_rating INTEGER NOT NULL,
            notes TEXT,
            submitted_at_utc TEXT,
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
        )
        """)
        
        # 3. Saved Investigations Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_investigations (
            id TEXT PRIMARY KEY,
            title TEXT,
            ra_deg REAL NOT NULL,
            dec_deg REAL NOT NULL,
            fov_arcmin REAL DEFAULT 3.0,
            notes TEXT,
            created_at_utc TEXT
        )
        """)
        
        conn.commit()
        _seed_challenge_candidates(cursor)
        conn.commit()

def _seed_challenge_candidates(cursor):
    """Pre-populates the five NASA challenge targets into the candidates queue."""
    challenge_targets = [
        (
            "SPX-CAND-269452+004693",
            "Barnard's Star",
            269.45208,
            4.69333,
            88.5,
            "HIGH_PRIORITY_CANDIDATE",
            "Extreme Proper Motion",
            10390.0,
            0.12,
            '["Extreme proper motion (10.39 arcsec/yr) verified in Gaia DR3 and SPHEREx.", "Cold M4 dwarf in immediate solar neighborhood."]',
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        ),
        (
            "SPX-CAND-331043-056782",
            "Epsilon Indi B",
            331.04375,
            -56.78278,
            82.0,
            "HIGH_PRIORITY_CANDIDATE",
            "Cold Brown Dwarf Binary",
            4705.0,
            0.20,
            '["Cold T-dwarf substellar binary companion.", "Strong methane and water ice signatures in near-infrared SPHEREx bands."]',
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        ),
        (
            "SPX-CAND-133795-007245",
            "WISE 0855-0714",
            133.79513,
            -7.24515,
            94.0,
            "HIGH_PRIORITY_CANDIDATE",
            "Sub-Zero Brown Dwarf",
            8140.0,
            0.35,
            '["Fourth closest system to the Sun.", "Sub-freezing atmospheric temperature (~250 K), prominent water clouds / ice features."]',
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        ),
        (
            "SPX-CAND-076956+030401",
            "RW Aurigae",
            76.95642,
            30.40142,
            89.0,
            "HIGH_PRIORITY_CANDIDATE",
            "Eruptive YSO Variable",
            18.5,
            2.85,
            '["Young Stellar Object (T Tauri) showing dramatic occultation and dimming events.", " circumstellar disk dust variability."]',
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        ),
        (
            "SPX-CAND-248167+066755",
            "R Draconis",
            248.16750,
            66.75500,
            78.0,
            "HIGH_PRIORITY_CANDIDATE",
            "Mira Pulsating Giant",
            12.0,
            5.20,
            '["Long-period Mira pulsating variable star (~245 day period).", "Dramatic multi-magnitude infrared flux swings across epochs."]',
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )
    ]
    
    for cand in challenge_targets:
        cursor.execute("""
        INSERT OR IGNORE INTO candidates (
            candidate_id, target_name, ra_deg, dec_deg, anomaly_score,
            classification_tier, badge, proper_motion_mas_yr,
            variability_amplitude, reasons_json, created_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, cand)

def submit_citizen_classification(data: Dict[str, Any]) -> int:
    """Inserts a new citizen review submission."""
    ensure_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO citizen_classifications (
            candidate_id, user_identifier, is_real_motion, motion_direction,
            is_variable_brightness, is_image_artifact, artifact_type,
            confidence_rating, notes, submitted_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["candidate_id"],
            data.get("user_identifier", "anonymous_citizen"),
            1 if data.get("is_real_motion") else 0,
            data.get("motion_direction"),
            1 if data.get("is_variable_brightness") else 0,
            1 if data.get("is_image_artifact") else 0,
            data.get("artifact_type"),
            data.get("confidence_rating", 3),
            data.get("notes"),
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        ))
        conn.commit()
        return cursor.lastrowid

def get_candidate_classifications(candidate_id: str) -> Dict[str, Any]:
    """Retrieves aggregated citizen science statistics for a candidate."""
    ensure_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM citizen_classifications WHERE candidate_id = ?", (candidate_id,))
        rows = cursor.fetchall()
        
        total = len(rows)
        if total == 0:
            return {
                "candidate_id": candidate_id,
                "total_votes": 0,
                "motion_votes": 0,
                "variable_votes": 0,
                "artifact_votes": 0,
                "consensus_rating": 0.0,
                "classifications": []
            }
            
        motion_cnt = sum(1 for r in rows if r["is_real_motion"] == 1)
        var_cnt = sum(1 for r in rows if r["is_variable_brightness"] == 1)
        art_cnt = sum(1 for r in rows if r["is_image_artifact"] == 1)
        avg_conf = sum(r["confidence_rating"] for r in rows) / total
        
        return {
            "candidate_id": candidate_id,
            "total_votes": total,
            "motion_votes": motion_cnt,
            "variable_votes": var_cnt,
            "artifact_votes": art_cnt,
            "consensus_rating": round(avg_conf, 1),
            "classifications": [dict(r) for r in rows[-15:]]
        }

def list_candidates(limit: int = 20) -> List[Dict[str, Any]]:
    """Returns candidate review queue ordered by anomaly score."""
    ensure_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates ORDER BY anomaly_score DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]

# Auto-ensure on import
ensure_db()

