# Nevera Film Room: handoff

Read this first, then r/nevera/README.md for the masterplan.

## What this is
The storyboard animatic v5 (5:25, 112 shots, 16 scenes) as a working room, on the same engine as the HRID Model Room.

- `cut/` Cutting Room. V1 storyboard stills, A1 mixed audio, scenes, VO and on-screen figures on the timeline. Each shot has place, cast, prompt, stage and takes.
- `mp/` Masterplan viewer: our masterplan baked from the live page at true scale, with 73 placed rigged figures.
- `cast/` Cast viewer: 43 rigged figures with instruments.
- `stage/` One 3D frame per located shot, used by the compare views and the Seedance pack.

## Where edits live
The team saves on the Claude link: https://claude.ai/artifact/C3BQapqqYDVrLgEk2EQ16L (db collections shots, takes, scenes). The hub copy, /nevera-room, is read-only.

## Rebuild (tools/)
1. `mp_export.py` pulls the scene from aromahub.studio/nevera (run it after any masterplan change).
2. `figures.py` writes the cast. `build_data.py` writes shots, film text, sprite, audio mix and motion.
3. `mp_presets.py` writes starting frames and cast positions; `mp_bake.py` writes the viewer scene; `build_mp.py` and `build_viewer.py` write the viewer pages; `build_cut.py` writes the Cutting Room; `stage_frames.py` renders the 3D frames.
4. `push_hub.py "<message>"` pushes the read-only copy.

The sources for build_cut and build_viewer are the HRID pages (cut/index.html and studio/index.html of https://claude.ai/artifact/9Sqtaqghe3stZ2ZY9ToseZ).

## Rules that apply
- Places come from our masterplan (`places_map.py`). 26 shots have no named plot: they use the nearest plot and are marked as needing confirmation.
- Figures in the film come only from the client's Nevera files.
- No race cars, track, or race name on screen. Frame shot_10-6.jpg (SH063) still draws a Formula car and has to be redrawn.
- Seedance: feed characters, location and keyframe as references. Never animate the still as a start frame.
- Pyramid sizes in the storyboard are a cheat against the real 10-12 km distance. Amr has to decide.
