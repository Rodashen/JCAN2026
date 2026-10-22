# Individual skills video guides

Updated 2026-10-22. Official English and Philippines videos were identified through
HRD Korea's guide page:
https://epstopik.hrdkorea.or.kr/epstopik/skill/SkillBook.do?lang=en

The chapter boundaries in `js/skills-video-catalog.mjs` are transcribed from each
official video's published description. Both language versions publish the same
boundaries and durations. Seven manufacturing/Service I, four Service II, five
fitness, and six interview chapters provide 22 selections per language.

The player uses YouTube's documented `start` and `end` parameters. End times are
absolute seconds from the original video's beginning. These are bounded embeds,
not separate edited files, and YouTube remains required for playback. A viewer
can still use YouTube's own controls or open the full original video.

The original JCAN logo overlays the page's player wrapper. The page fullscreen
button expands that wrapper, retaining the logo and a keyboard-accessible exit.
The logo is not burned into the publisher's original or downloadable media.
Source attribution stays visible. Native fullscreen is hidden in the iframe to
avoid a fullscreen view that drops the wrapper branding. Browsers without wrapper
fullscreen keep inline playback and the source link.

Validation: 42 automated tests; browser checks for language/group/skill changes,
chapter URLs, original-source links, logo loading, fullscreen and exit, and mobile
layout. External playback was mocked in that UI check; the eight official source
videos and their chapter descriptions were fetched separately to verify metadata.
