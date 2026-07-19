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
        layout: 'stacked',
        title: '不同可达性计算方式对比\nComparison of Accessibility Measures',
        text: '本研究将具体活动类型及其强度视为可达性分析的目的地，而非将公园作为单一整体。在这一活动导向的框架下，可达性反映居民参与特定活动的机会，而不仅是到达公园的能力，从而更准确地体现公园功能的多样性。\n\nThis study treats specific activity types and intensity levels, rather than parks as a whole, as the destinations of accessibility analysis. Under this activity-oriented framework, accessibility reflects opportunities to participate in particular activities rather than simply reach a park, providing a more accurate representation of park functional diversity.'
      },
      {
        image: 'assets/accessibility_figure/02-web.webp',
        label: 'Figure 02',
        title: '大语言模型表现对比\nComparison of LLM Performance',
        text: '通过比较人工标注测试集与不同模型的识别结果，Qwen3.5-V2表现最佳，因此被选为主要模型。\n\nBy comparing model outputs with a manually annotated test set, Qwen3.5-V2 achieved the best overall performance and was therefore selected as the primary model.'
      },
      {
        image: 'assets/accessibility_figure/03-web.webp',
        label: 'Figure 03',
        layout: 'stacked',
        title: '消融实验结果\nAblation Study Results',
        text: '传统关键词和机器学习方法难以兼顾精确率与召回率。相比之下，完整LLM流程取得了最佳表现，在Micro-F1、Macro-F1和Jaccard指标上均明显优于基础模型，同时保持了较稳定的召回率，说明提示词设计、任务分解和后处理能够有效提升活动识别的准确性与类别均衡性。\n\nTraditional keyword-based and machine-learning methods struggled to balance precision and recall. In contrast, the full LLM pipeline achieved the best performance, substantially improving Micro-F1, Macro-F1, and Jaccard over the basic model while maintaining stable recall. This indicates that prompt design, task decomposition, and post-processing effectively improve identification accuracy and class-level balance.'
      },
      {
        image: 'assets/accessibility_figure/04-web.webp',
        label: 'Figure 04',
        title: '公园面积可达性与活动可达性存在明显差异\nMismatch Between Park Area and Activity Accessibility',
        text: '公园面积可达性并不能充分反映居民实际获得的活动机会。部分地区虽然邻近公园或面积可达性较高，但活动类型、服务容量和设施配置仍然有限，说明到达公园并不等同于获得多样且适宜的活动服务。\n\nPark-area accessibility does not fully reflect residents’ actual access to recreational opportunities. Some neighborhoods are close to parks or have high area-based accessibility but still offer limited activity types, service capacity, and facilities. Reaching a park therefore does not necessarily ensure access to diverse and appropriate activities.'
      },
      {
        image: 'assets/accessibility_figure/05-web.webp',
        label: 'Figure 05',
        title: '公园活动可达性呈现显著的中心—外围空间分异\nSpatial Disparities in Activity Accessibility',
        text: '西雅图中心城区及邻近地区在活动多样性、出行、健身、体育、家庭、休闲和文化活动等方面具有较高可达性，可能与活动供给丰富、步行网络连续和公园使用热度较高有关。相比之下，南部地区在多数活动类别中表现出持续低可达性，反映出供给不足、步行连通性较弱和人口竞争压力较高等问题。\n\nCentral Seattle and adjacent neighborhoods show high accessibility across activity diversity, mobility, fitness, sports, family, leisure, and cultural activities. This pattern may be related to diverse activity provision, continuous pedestrian networks, and greater park popularity. In contrast, southern Seattle consistently exhibits low accessibility across most categories, reflecting insufficient provision, limited pedestrian connectivity, and stronger population competition.'
      },
      {
        image: 'assets/accessibility_figure/06-web.webp',
        label: 'Figure 06',
        title: '公园面积不能替代活动设施与功能供给\nPark Size Does Not Equal Activity Provision',
        text: '公园面积与活动多样性的空间分布并不完全一致。部分大型公园主要提供自然体验、步行和休闲活动，而面积较小但设施密集的城市公园可能支持更多活动类型。因此，增加公园面积不能替代对设施、项目和活动功能的精细配置。\n\nThe spatial distributions of park area and activity diversity do not fully correspond. Some large parks mainly support nature-based experiences, walking, and leisure, whereas smaller but highly programmed urban parks may provide a wider range of activities. Increasing park area therefore cannot substitute for targeted facilities, programs, and activity functions.'
      },
      {
        image: 'assets/accessibility_figure/07-web.webp',
        label: 'Figure 07',
        title: '不同活动类型表现出明显的地理依赖性\nGeographic Differences in Activity Accessibility',
        text: '部分活动机会受到自然地理和城市功能布局的限制。水上活动主要集中于滨水地区，内陆社区居民获得游泳及亲水活动的机会较少。文化活动则更多集中于城市中心和区域节点，使外围地区居民较难参与节庆、公共活动和社区聚会。\n\nSome activity opportunities are constrained by physical geography and urban functions. Water-based activities are concentrated along the waterfront, limiting access for inland residents. Cultural activities are also clustered in the urban center and regional nodes, reducing access to festivals, public events, and community gatherings in peripheral neighborhoods.'
      },
      {
        images: ['assets/accessibility_figure/09-web.webp','assets/accessibility_figure/10-web.webp'],
        label: 'Figure 08',
        layout: 'stacked',
        title: '儿童和老年人口的活动需求与公园供给存在空间错配\nMismatch Between Age-Specific Demand and Supply',
        text: '儿童和老年人口分布与相关活动供给之间存在明显错配。部分儿童和老年人口集中的居住区缺乏足够的儿童游憩、体育和休闲设施，说明现有公园供给尚未充分回应不同年龄群体的需求。\n\nA clear mismatch exists between the distribution of children and older adults and the provision of relevant activities. Several neighborhoods with high concentrations of these groups lack sufficient play, sports, and leisure facilities, indicating that current park provision does not adequately address age-specific needs.'
      },
      {
        image: 'assets/accessibility_figure/08-web.webp',
        label: 'Figure 09',
        title: '现有优先发展区域尚未完全识别活动公平性缺口\nGaps in Existing Priority Areas',
        text: '活动可达性低值区与西雅图现有优先发展区域并不完全重合。尽管现有政策关注公园面积、开放空间质量和社会公平，但指标仍较为宏观，难以识别具体活动类型、多样性和服务能力的不足。因此，现有优先发展策略尚未完全回应活动机会公平问题。\n\nAreas of low activity accessibility do not fully overlap with Seattle’s existing prioritization areas. Although current policies consider park acreage, open-space quality, and social equity, their indicators remain too broad to identify deficiencies in specific activity types, diversity, and service capacity. Existing prioritization strategies therefore do not fully address inequities in recreational opportunities.'
      }
    ]
  },
  regression: {
    eyebrow: 'Figure & text',
    title: 'Regression Results',
    intro: '',
    folder: 'assets/regression_figure/',
    items: [
      {
        image: 'assets/regression_figure/01.png',
        label: 'Figure 01',
        layout: 'stacked',
        title: 'OLS回归结果：西雅图公园可达性的社会人口影响因素\nOLS Regression Results: Socio-demographic Correlates of Park Accessibility in Seattle',
        text: '该表展示了各社会人口变量与公园可达性之间的回归关系，包括回归系数、标准误、t统计量和显著性水平。主要解释变量包括总人口、18岁以下人口、65岁及以上人口、家庭收入中位数和种族构成，用于识别不同人群在公园可达性方面的潜在差异。\n\nThis table presents the regression coefficients, standard errors, t-statistics, and significance levels for the socio-demographic correlates of park accessibility. Key predictors include total population, populations under 18 and aged 65 or above, median household income, and racial composition, allowing potential disparities in park accessibility across population groups to be identified.'
      },
      {
        image: 'assets/regression_figure/02-web.webp',
        label: 'Figure 02',
        title: 'OLS模型诊断结果\nOLS Model Diagnostic Plots',
        text: 'Q-Q图用于检验残差的正态性，结果整体接近理论分布，但尾部存在轻微偏离。Cook距离图用于识别对模型结果影响较大的异常观测值，其中红色虚线表示4/n阈值。少数观测值超过或接近该阈值，需要进一步核查，但总体上未明显影响模型稳定性。\n\nThe Q-Q plot evaluates the normality of the residuals and indicates an overall good fit, with minor deviations at the tails. Cook’s Distance is used to identify influential observations, with the red dashed line representing the 4/n threshold. A small number of observations approach or exceed this threshold and warrant further examination, but they do not appear to undermine the overall stability of the model.'
      },
      {
        icon: 'policy',
        tags: ['Activity diversity','Service capacity','Population fit'],
        label: 'Insight 03',
        title: '政策建议\nPolicy Recommendations',
        text: '公园规划应从距离和面积导向的可达性评价转向活动导向的可达性评价。在优先发展区域识别中，应纳入活动多样性、服务容量、感知质量和人群适配性等指标，并重点关注儿童、老年人、低收入群体和无车家庭的活动供需错配。\n\nPark planning should shift from distance- and area-based accessibility toward activity-based accessibility. The identification of priority areas should incorporate activity diversity, service capacity, perceived quality, and population suitability, with particular attention to demand–supply mismatches affecting children, older adults, low-income residents, and car-free households.'
      },
      {
        icon: 'contribution',
        tags: ['Concept','Method','Data','Planning'],
        label: 'Insight 04',
        title: '研究贡献\nResearch Contributions',
        text: '在概念层面，本研究将公园可达性从公园整体导向拓展为具体活动导向；在方法层面，利用大语言模型识别Google Reviews中的活动语义；在数据层面，将非结构化评论转化为公园活动画像；在规划层面，揭示传统距离和面积指标难以识别的活动公平问题。\n\nConceptually, this study extends park-based accessibility toward activity-based accessibility. Methodologically, it applies a large language model to identify activity-related meanings in Google Reviews. Empirically, it transforms unstructured reviews into park-level activity profiles. From a planning perspective, it reveals functional inequities that conventional distance- and area-based measures may overlook.'
      },
      {
        icon: 'limitations',
        tags: ['Platform bias','LLM uncertainty','Daytime demand'],
        label: 'Insight 05',
        title: '研究局限\nLimitations',
        text: 'Google Reviews可能偏向知名公园、游客密集型公园及平台活跃人群，因此评论缺失并不代表活动不存在。LLM识别结果也可能受到提示词设计、语义模糊和多标签边界的影响。此外，仅使用居住人口可能低估市中心游客、通勤者和日间使用者产生的实际需求。\n\nGoogle Reviews may overrepresent well-known parks, tourist-oriented parks, and digitally active users; therefore, the absence of reviews does not necessarily indicate the absence of activities. LLM outputs may also be affected by prompt design, semantic ambiguity, and unclear boundaries between multiple labels. In addition, residential population data may underestimate demand generated by tourists, commuters, and other daytime users in the city center.'
      },
      {
        icon: 'conclusion',
        tags: ['Reach','Participate','Equity'],
        label: 'Insight 06',
        title: '结论\nConclusion',
        text: '尽管西雅图在传统公园可达性指标上表现较好，但其活动机会在空间上仍分布不均。公园公平性不仅取决于距离和面积，还应考虑具体活动的类型、强度、多样性和质量。结合LLM、Google Reviews与2SFCA方法，可以构建活动导向的公园可达性评估框架。公园公平性的核心不只是居民能否到达公园，而是能否获得多样、适宜且符合实际需求的活动机会。\n\nAlthough Seattle performs well under conventional measures of park accessibility, park activity opportunities remain unevenly distributed. Park equity should therefore be evaluated not only by distance and area but also by the type, intensity, diversity, and quality of available activities. Integrating LLM-based review analysis with Google Reviews and the 2SFCA method provides an activity-oriented accessibility framework. Ultimately, park equity concerns not only whether residents can reach a park, but whether they can access diverse, appropriate, and demand-responsive recreational opportunities.'
      }
    ]
  }
};
