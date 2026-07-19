/*
 * Analysis modal content
 * ----------------------
 * 1. Put the finished figure in the matching assets folder.
 * 2. Add one object to that page's `items` array.
 * 3. Keep one figure, one title and one concise interpretation in each object.
 *
 * Example:
 * {
 *   image: 'assets/accessibility_figure/your-figure.png',
 *   alt: 'A short accessible description of the figure',
 *   label: 'Figure 01',
 *   title: 'What this figure demonstrates',
 *   text: 'The corresponding analytical interpretation.',
 *   caption: 'Optional source or method note.'
 * }
 */
window.ANALYSIS_CONTENT = {
  study: {
    eyebrow: 'Spatial data & coverage',
    title: 'Study Area Analysis',
    intro: 'Three test figures demonstrate the one-figure, one-interpretation reading format.',
    folder: 'assets/description_figure/',
    items: [
      {
        image: 'assets/description_figure/%E5%B8%83%E5%B1%80.png',
        alt: 'Seattle park-use polygons, Census tract boundaries and geocoded park review ratings shown across the city.',
        label: 'Figure 01',
        title: 'Citywide park and review coverage',
        text: 'Seattle’s park system and the geocoded review sample are mapped together to establish the spatial coverage of the study. Green polygons distinguish park-use categories, while colored review symbols represent rating levels from one to five and Census tracts provide a consistent demographic reference frame. The citywide pattern shows broad observational coverage, with denser concentrations through the central corridor, waterfront districts and southeast Seattle; sparsely reviewed areas should therefore be interpreted with greater caution.',
        caption: 'Park-use classification, geocoded review ratings and Census tract context.'
      },
      {
        image: 'assets/description_figure/%E5%B8%83%E5%B1%80b.png',
        alt: 'Simplified Seattle study-area map emphasizing park polygons and the spatial distribution of review ratings.',
        label: 'Figure 02',
        title: 'Public experience across the park system',
        text: 'This simplified view focuses attention on the relationship between official park footprints and public-experience observations. Review ratings occur across the full study area rather than in a single district, but their density remains uneven: the urban core and connected north–south corridor contain many observations, whereas several peripheral areas have fewer. This distribution supports citywide comparison while also making the limits of the review sample visible instead of treating all locations as equally documented.',
        caption: 'A reduced map composition for reading the distribution and completeness of review evidence.'
      },
      {
        image: 'assets/description_figure/%E5%B8%83%E5%B1%80c.png',
        alt: 'Seattle parks overlaid on fine-grained Census Block Group boundaries.',
        label: 'Figure 03',
        title: 'Block Groups as the accessibility unit',
        text: 'The final study-area figure aligns park supply with the Census Block Group geography used in the accessibility model. The fine-grained units cover nearly all of Seattle and preserve neighborhood-scale variation that would be concealed by larger community or tract boundaries. Large park assets are concentrated in several northern, western and eastern locations, while the central and southern urban fabric contains a more fragmented network of smaller sites—an uneven spatial structure that motivates the subsequent 15-minute accessibility analysis.',
        caption: 'Official park boundaries and Census Block Groups used as accessibility origins.'
      }
    ]
  },
  accessibility: {
    eyebrow: '15-minute E2SFCA',
      title: 'Accessibility Results',
    intro: 'Figures and interpretations for accessibility results will be assembled here.',
    folder: 'assets/accessibility_figure/',
    items: []
  },
  regression: {
    eyebrow: 'Spatial model results',
      title: 'Regression Results',
    intro: 'Future regression figures and model interpretations can use the same component.',
    folder: 'assets/regression_figure/',
    items: []
  }
};
