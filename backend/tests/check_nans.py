from astropy.io import fits
import numpy as np

fits_path = "backend/data/raw/spherex/rdraconis/level2_2025W17_4B_0021_1_D3_spx_l2b_cutout.fits"
with fits.open(fits_path) as h:
    d = h[1].data
    print("Shape:", d.shape)
    print("NaN count:", np.count_nonzero(np.isnan(d)))
    print("Where are NaNs?")
    nan_ys, nan_xs = np.where(np.isnan(d))
    for y, x in zip(nan_ys, nan_xs):
        print(f"NaN at (x={x}, y={y})")
