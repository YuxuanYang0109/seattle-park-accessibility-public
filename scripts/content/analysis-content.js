/* Intermediate figure layout: content is transcribed from each assets/*_figure/text.txt. */
window.ANALYSIS_CONTENT = {
  study: {
    eyebrow: 'Figure & text',
    title: 'Study Area Analysis',
    intro: '',
    folder: 'assets/description_figure/',
    items: [
      {
        image: 'assets/description_figure/01-web.webp',
        label: 'Figure 01',
        title: '西雅图公园可达性政策优先改善规划图与现状图对比\nFig.1 Park Area Accessibility Based on Park Acreage Fig.2 Seattle Park and Open Space Prioritization Areas',
        text: '核心问题：公园面积可达性是否能够准确反映公园活动的实际供给与需求？西雅图现有的优先发展区域，是否真正实现了其公平性目标？\n\nCore Questions: Can park area accessibility accurately capture the actual supply of and demand for park-based activities? Have Seattle’s existing priority development areas effectively achieved their equity objectives?'
      },
      {
        image: 'assets/description_figure/02-web.webp',
        label: 'Figure 02',
        title: '研究框架\nResearch Framework',
        text: '该图展示了本研究综合性的方法论框架，分为四个连续的阶段：(a) 数据整合，(b) 人类-大语言模型（LLM）挖掘，(c) 可达性计算，以及 (d) 公平性与规划。该框架有效整合了大数据（评论）、人工智能（LLM）和GIS空间分析，以超越简单的可达性度量。其旨在基于实际活动和用户体验，提供对公园可达性的细致理解，最终指导精准的城市规划干预。\n\n(a) Data Integration, (b) Human-LLM Mining, (c) Accessibility Calculation, and (d) Equity & Planning. The framework effectively integrates Big Data (reviews), AI (LLMs), and GIS spatial analysis to move beyond simple proximity measures. It aims to provide a nuanced understanding of park equity based on actual activities and user experiences, ultimately guiding precise urban planning interventions.'
      },
      {
        image: 'assets/description_figure/03-web.webp',
        label: 'Figure 03',
        title: '活动分类体系\nClassification system of activity',
        text: '系统依据预设的活动分类体系对公园评论进行分类。该分类体系包括七类核心活动：G01 移动与耐力类活动、G02 健身与身心活动、G03 球类与场地运动、G04 水上与沙滩活动、G05 家庭、儿童与宠物活动、G06 休闲、社交与自然体验，以及 G07 文化、活动与公共生活。对于缺乏明确实际活动证据的评论，则归入单独的无活动类别。\n\npark reviews are classified according to a predefined activity taxonomy. The taxonomy includes seven core activity groups: mobility and endurance, fitness and mind-body activities, ball and court sports, water and beach activities, family, children and pets, leisure, social and nature activities, and culture, events and civic life. Reviews without explicit evidence of actual activities are assigned to a separate no-activity category.'
      },
      {
        image: 'assets/description_figure/04-web.webp',
        label: 'Figure 04',
        layout: 'stacked',
        title: '技术路线\nTechnical route',
        text: '该技术路线图展示了本研究如何利用 LLM 从 Google Reviews 中识别公园活动信息，并将非结构化评论文本转化为可用于空间分析的结构化数据。首先，研究收集 Google Reviews、公园点位、评分和评论数量等基础数据；随后构建七类核心活动的分类体系（G01–G07），并设计 prompt 引导 LLM 对每条评论进行多标签活动识别。之后，研究通过人工标注样本建立 ground truth，并使用 precision、recall、F1-score 和 exact match rate 对模型效果进行验证。在 review-level 分类结果的基础上，进一步汇总形成 park-level activity profiles，包括各类活动提及次数、活动多样性、completed reviews 和 weighted rating。最终，这些结构化活动数据被用于生成活动分布图、构建 2SFCA 活动可达性指标，并支持后续的空间公平性分析与规划建议。该流程的核心意义在于：LLM 并不是替代传统 GIS 与空间分析，而是作为语义提取工具，将用户评论中的真实使用经验转化为更接近实际行为的活动供给数据。\n\nThis diagram illustrates the LLM-based workflow used in this study to extract park activity information from Google Reviews and transform unstructured review texts into structured data for spatial analysis. First, the study collects Google Reviews, park locations, ratings, and review counts. It then develops a seven-group activity taxonomy (G01–G07) and designs prompts to guide the LLM in performing multi-label classification for each review. Next, human-labeled samples are used to build the ground truth, and model performance is evaluated using precision, recall, F1-score, and exact match rate. Based on the review-level classification results, the outputs are aggregated to the park level to generate park activity profiles, including activity mention counts, activity diversity, completed reviews, and weighted ratings. These structured activity indicators are then used to produce activity distribution maps, construct 2SFCA-based activity accessibility measures, and support subsequent spatial equity analysis and planning recommendations. The key contribution of this workflow is that the LLM does not replace GIS or spatial analysis; rather, it serves as a semantic extraction tool that converts user-generated reviews into activity supply data that more closely reflect actual park use.'
      }
    ]
  },
  accessibility: {
    eyebrow: 'Figure & text',
    title: 'Accessibility Results',
    intro: '',
    folder: 'assets/accessibility_figure/',
    items: [
      {
        image: 'assets/accessibility_figure/01-web.webp',
        label: 'Figure 01',
        title: '大语言模型表现对比\nComparison of LLM models performance',
        text: ''
      },
      { image: 'assets/accessibility_figure/02-web.webp', label: 'Figure 02', title: '', text: '' },
      { image: 'assets/accessibility_figure/03-web.webp', label: 'Figure 03', title: '', text: '' },
      { image: 'assets/accessibility_figure/04-web.webp', label: 'Figure 04', title: '', text: '' },
      { image: 'assets/accessibility_figure/05-web.webp', label: 'Figure 05', title: '', text: '' },
      { image: 'assets/accessibility_figure/06-web.webp', label: 'Figure 06', title: '', text: '' },
      { image: 'assets/accessibility_figure/07-web.webp', label: 'Figure 07', title: '', text: '' },
      { image: 'assets/accessibility_figure/08-web.webp', label: 'Figure 08', title: '', text: '' },
      { image: 'assets/accessibility_figure/09-web.webp', label: 'Figure 09', title: '', text: '' }
    ]
  },
  regression: {
    eyebrow: 'Figure & text',
    title: 'Regression Results',
    intro: '',
    folder: 'assets/regression_figure/',
    items: [
      { image: 'assets/regression_figure/01.png', label: 'Figure 01', title: '', text: '' },
      { image: 'assets/regression_figure/02-web.webp', label: 'Figure 02', title: '', text: '' },
      { image: 'assets/regression_figure/03-web.webp', label: 'Figure 03', title: '', text: '' }
    ]
  }
};
