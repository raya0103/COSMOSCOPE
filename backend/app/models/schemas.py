"""
Pydantic schemas and data models for SPHEREx EXPLORER.
"""
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class CoordinateInput(BaseModel):
    ra: Union[float, str] = Field(..., description="Right Ascension in decimal degrees or sexagesimal HMS")
    dec: Union[float, str] = Field(..., description="Declination in decimal degrees or sexagesimal DMS")
    fov_arcmin: float = Field(default=3.0, ge=0.5, le=30.0, description="Field of view in arcminutes")
    target_name: Optional[str] = Field(default=None, description="Optional target designation")

class TargetCoordinate(BaseModel):
    ra_deg: float
    dec_deg: float
    ra_hms: str
    dec_dms: str
    target_name: Optional[str] = None
    resolved_by: str = "direct"

class ObservationRecord(BaseModel):
    obs_id: str
    energy_bandpassname: str
    detector: int
    t_min_mjd: float
    t_max_mjd: float
    obs_date_iso: str
    t_exptime_sec: float
    access_url: str
    cutout_url: str
    obs_collection: str
    calib_level: int = 2
    dataproduct_type: str = "image"
    s_ra: float
    s_dec: float
    is_cached: bool = False
    visit_id: Optional[str] = None
    step_number: Optional[int] = None
    visit_group: Optional[str] = None
    is_independent_visit: bool = True
    wavelength_range_um: Optional[List[float]] = None

class ObservationSearchResponse(BaseModel):
    target: TargetCoordinate
    total_observations: int
    epochs_count: int
    bands_available: List[str]
    detectors_available: List[int]
    time_span_days: float
    first_epoch_iso: Optional[str] = None
    last_epoch_iso: Optional[str] = None
    observations: List[ObservationRecord]
    archive_source: str = "NASA/IPAC IRSA (spherex.obscore)"
    can_compare: bool = True
    comparison_note: Optional[str] = None
    historical_multi_mission_available: bool = False

class MultiMissionEpoch(BaseModel):
    epoch_index: int
    mission: str
    survey_facility: str
    obs_id: str
    obs_date_iso: str
    t_min_mjd: float
    energy_bandpassname: str
    wavelength_um: float
    measured_ra_deg: float
    measured_dec_deg: float
    displacement_from_t0_arcsec: float
    gaia_predicted_ra_deg: float
    gaia_predicted_dec_deg: float
    residual_arcsec: float
    measured_flux_mjy: float
    is_spherex: bool
    provenance_archive: str

class MultiMissionResponse(BaseModel):
    target: TargetCoordinate
    total_epochs: int
    time_span_years: float
    total_displacement_arcsec: float
    annual_proper_motion_arcsec_yr: float
    gaia_dr3_source_id: Optional[str] = None
    epochs: List[MultiMissionEpoch]
    scientific_summary: str

class FITSImageMetadata(BaseModel):
    obs_id: str
    detector: int
    band: str
    date_obs: str
    bunit: str
    pixel_scale_arcsec: float
    image_shape: List[int]
    min_flux: float
    max_flux: float
    median_flux: float
    flags_summary: Dict[str, int]
    central_wavelength_um: Optional[float] = None
    bandwidth_um: Optional[float] = None
    provenance_checksum_md5: str

class SpectralPoint(BaseModel):
    channel_index: int
    wavelength_um: float
    bandwidth_um: float
    flux_density_mjy_sr: float
    flux_density_ujy: float
    flux_err_mjy_sr: float
    flag: int
    detector: int
    obs_id: str
    obs_date_iso: str

class SpectrumResponse(BaseModel):
    target: TargetCoordinate
    channels_count: int
    wavelength_range_um: List[float]
    spectral_points: List[SpectralPoint]
    ice_absorption_signatures: Dict[str, Any]
    provenance: str

class MotionCandidate(BaseModel):
    candidate_id: str
    ra_deg: float
    dec_deg: float
    epoch1_iso: str
    epoch2_iso: str
    baseline_days: float
    displacement_arcsec: float
    proper_motion_mas_yr: float
    position_angle_deg: float
    gaia_match_source_id: Optional[str] = None
    gaia_pmra: Optional[float] = None
    gaia_pmdec: Optional[float] = None
    pm_agreement_sigma: Optional[float] = None
    is_real_motion: bool
    confidence_score: float
    anomaly_score: float
    flags: List[str]

class AnomalyScoreDetail(BaseModel):
    candidate_id: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    motion_score: float
    variability_score: float
    spectral_score: float
    catalog_anomaly_score: float
    interpretable_reasons: List[str]
    quality_confidence: float
    recommended_action: str

class ImageOperationRequest(BaseModel):
    obs_id_1: Optional[str] = None
    obs_id_2: Optional[str] = None
    obs_ids: Optional[List[str]] = None
    ra: float
    dec: float
    fov_arcmin: float = 3.0
    normalize: bool = True
    color_map: str = "inferno"
    stretch: str = "asinh"

class CitizenClassificationSubmission(BaseModel):
    candidate_id: str
    user_identifier: str = "anonymous_citizen"
    is_real_motion: bool
    motion_direction: Optional[str] = None
    is_variable_brightness: bool
    is_image_artifact: bool
    artifact_type: Optional[str] = None
    confidence_rating: int = Field(..., ge=1, le=5)
    notes: Optional[str] = None

class CitizenClassificationStats(BaseModel):
    candidate_id: str
    total_votes: int
    motion_votes: int
    variable_votes: int
    artifact_votes: int
    consensus_rating: float
    classifications: List[Dict[str, Any]]
