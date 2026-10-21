"""Turns the pasted Orbit Delivery component into Polaris.
Run from project root:  python scripts/customize_hero.py
Reads components/ui/orbit-delivery-hero.tsx -> writes components/polaris/polaris-hero.tsx
Every replacement is checked; anything not found is reported."""
import pathlib, sys
src = pathlib.Path("components/ui/orbit-delivery-hero.tsx").read_text(encoding="utf-8")
R = [
 ('aria-label="Orbit Delivery home"','aria-label="Polaris home"'),
 ('orbit<small>delivery</small>','polaris<small>polar energy AI</small>'),
 ('<button onClick={explore}>Delivery</button>','<button onClick={explore}>Overview</button>'),
 ('"For business"','"Technology"'),('"Our story"','"Impact"'),
 ('<button className="header-cta" disabled>Meet your courier</button>','<a className="header-cta" href="/signup">Request demo</a>'),
 ('Good things, on their way','Antarctic · Arctic · Clean energy'),
 ('Good things.<br />Delivered<br /><em>with care.</em>','Powering polar<br />research with<br /><em>clean energy.</em>'),
 ('Parcels, packages, and a little peace of mind.<br className="desktop-break" /> From your doorstep to theirs.','AI forecasting and dispatch that cuts diesel<br className="desktop-break" /> at Bharati, Maitri and Himadri.'),
 ('<button className="explore-button" disabled>Meet your courier <Arrow /></button>','<a className="explore-button" href="/signup">Get early access <Arrow /></a>'),
 ('From your doorstep to theirs.','From forecast to dispatch.'),
 ('Every delivery begins with something worth sending. Pack it with care, choose its destination, and let the journey begin.','Polaris pulls a 7-day weather forecast, predicts station load, and plans battery and diesel use hour by hour.'),
 ('Our little courier brings that journey to life. Turn the globe and watch him find his way.','Turn the globe and follow our field runner across the ice.'),
 ('Your business. On the move.','Built on proven models.'),
 ('Orders heading out. Supplies coming in. A thoughtful delivery experience connects both sides of your business.','Random Forest load forecasting, Isolation Forest anomaly alerts and Grey Wolf dispatch optimization.'),
 ('Orbit Delivery puts the people behind every parcel at the heart of the journey.','Trained on Bharati and validated on Maitri, so it transfers between stations.'),
 ('Every parcel brings us closer.','Less diesel. Longer autonomy.'),
 ('A gift for someone far away. An order someone has been waiting for. An everyday essential, right at the door.','Every litre not burned stays in reserve, and its emissions never happen.'),
 ('Orbit Delivery is built around a simple idea: what we carry matters, and so does how we get it there.','Polaris keeps remote research stations running safely on more renewable power.'),
 ('Meet our world','Back to the globe'),
 ('Your little world is taking shape…','Loading the polar world…'),
 ('Small parcels<br />Big possibilities','Extreme cold<br />Smarter power'),
 ('A little<br />closer<br />to you','Bharati<br />Maitri<br />Himadri'),
 ('.orbit-delivery button:disabled{opacity:1}\n', '''.orbit-delivery button:disabled{opacity:1}
/* ---- Polaris skin ---- */
.orbit-delivery{--orbit-bg:transparent;--orbit-ink:#fff;--orbit-muted:#d6e2f7;--orbit-nav:#e4ecfb;--orbit-accent:#bcd3ff;--orbit-cloud:.85;background:transparent;color-scheme:dark}
.orbit-delivery .page{background:transparent}
.orbit-delivery .eyebrow{color:#a9c2f5}
.orbit-delivery .header-cta{background:#ffffff26;backdrop-filter:blur(8px)}
.orbit-delivery .explore-button{background:#fff;color:#0d1f4a}
.orbit-delivery .explore-button:hover{background:#e8f0ff!important}
.orbit-delivery a.header-cta,.orbit-delivery a.explore-button{display:inline-flex;align-items:center;justify-content:center}
.orbit-delivery .site-footer p,.orbit-delivery .motion-button,.orbit-delivery .planet-caption{color:#c5d6f5}
.orbit-delivery .about-dialog{background:#0f1e45;color:#fff;border-color:#2a3f78}
.orbit-delivery .brand-type small{color:#a9c2f5}
'''),
]
miss=0
for a,b in R:
    if a not in src: print("NOT FOUND:",a[:70]); miss+=1
    src=src.replace(a,b)
src=src.replace('theme = "auto"','theme = "light"')
out=pathlib.Path("components/polaris/polaris-hero.tsx"); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(src,encoding="utf-8")
print(f"written {out} ({miss} replacements missing)"); sys.exit(1 if miss else 0)
