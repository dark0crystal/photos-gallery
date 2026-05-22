export type PhotographerSlug = "photographerone" | "photographertwo";

export type PhotoMood = "raiq" | "hamas" | "sakhob";

export type Project = {
  slug: string;
  title: string;
  description: string;
  src: string;
  photographerId: PhotographerSlug;
  mood: PhotoMood;
  /** Natural pixel width (for layout aspect ratio). */
  width: number;
  /** Natural pixel height. */
  height: number;
};

export const PHOTOGRAPHERS: Record<
  PhotographerSlug,
  { label: string; marqueeTitle: string }
> = {
  photographerone: {
    label: "الخليل الصقري",
    marqueeTitle: "الخليل الصقري — أعمال مختارة",
  },
  photographertwo: {
    label: "المرداس البوسعيدي",
    marqueeTitle: "المرداس البوسعيدي — أعمال مختارة",
  },
};

export const GALLERY_ALL_MARQUEE = "المعرض — جميع المصورين";
export const GALLERY_FOOTER = "معرض الأعمال";

function photoPath(folder: PhotographerSlug, file: string): string {
  return `/photos/${folder}/${file}`;
}

function slugFor(folder: PhotographerSlug, file: string): string {
  return `${folder}-${file.replace(/\.[^.]+$/, "")}`;
}

/** Non-breaking title: photographer — صورة N */
function titleFor(folder: PhotographerSlug, workNumber: number): string {
  const base = PHOTOGRAPHERS[folder].label;
  const nbsp = " ";
  return `${base}${nbsp}—${nbsp}صورة${nbsp}${workNumber}`;
}

/** Explicit inventory under `public/photos` (dimensions from source files). */
const PHOTOGRAPHER_ONE: {
  file: string;
  width: number;
  height: number;
  mood: PhotoMood;
  description: string;
  title?: string;
}[] = [
  {
    file: "img1.jpg",
    width: 1080,
    height: 1080,
    mood: "raiq",
    title: "بحيرات الصفا",
    description:
      "تتشابك في هذه اللحظة خيوط السماء مع أقدام الأرض، وكأنّ المكان يتنفّس بإيقاع واحد بين الحضور والغياب. مشهد يجمع بين الإنسان وأفق لا نهاية له.",
  },
  {
    file: "img2.jpg",
    width: 1080,
    height: 719,
    mood: "hamas",
    title: "معزوفة الليل / Symphony of the night",
    description:
      "في عجلة من أمره، يتدفّق الجمع نحو هدف مشترك، وتلتقط العدسة تلك الشرارة التي تسبق اللحظة الكبرى. ثمّة شيء في الهواء يوحي بأنّ التاريخ يُسجَّل الآن.",
  },
  {
    file: "img3.jpg",
    width: 1080,
    height: 773,
    mood: "hamas",
    title: "العروبةِ العرِيقة",
    description:
      "طاقة لا تُرى بالعين المجرّدة لكنّها تُشعر بها كلّ خليّة في الجسد. هذه الصورة ليست توثيقاً بقدر ما هي إحساس يمتدّ ما بين الناظر والمُصوَّر.",
  },
  {
    file: "img4.jpg",
    width: 1080,
    height: 771,
    mood: "sakhob",
    title: "العروبةِ العرِيقة",
    description:
      "يخفي هذا المشهد خلف هدوئه الظاهر عمقاً من التناقضات؛ ما يبدو عادياً في نظرة أولى يكشف عن طبقات لا تُحصى كلّما أمعنت النظر فيه.",
  },
  {
    file: "img5.jpg",
    width: 1080,
    height: 773,
    mood: "raiq",
    title: "العروبةِ العرِيقة",
    description:
      "الضوء هنا ليس مجرّد إضاءة؛ إنّه يروي قصّة الوقت وكيف مرّ بصمت على هذا المكان. لحظة رائقة توقّفت عند حافّة النسيان.",
  },
  {
    file: "img6.jpg",
    width: 1080,
    height: 773,
    mood: "raiq",
    description:
      "تمتلك الصورة قدرة نادرة على احتجاز الزمن، وهذا المشهد يُثبت ذلك بجدارة. بساطة المكان لا تنقص من قيمته، بل تُضيف له طبقة من الصدق النادر.",
  },
  {
    file: "img7.jpg",
    width: 1080,
    height: 719,
    mood: "raiq",
    title: "بين وبين / in between",
    description:
      "أفق مفتوح يدعوك للتأمّل بعيداً عن ضجيج اليوم. كثيراً ما يكمن الجمال في الفراغات التي تتركها الصورة، لا فيما تملأه.",
  },
  {
    file: "img8.jpg",
    width: 1080,
    height: 1350,
    mood: "raiq",
    title: "بوابة السماء",
    description:
      "الفضاء الرأسي في هذه الصورة يمنح الموضوع هيبة تكاد تكون معمارية. ثمّة صمت ثقيل يسكن هذا الإطار، وهو من أعمق أنواع الصمت.",
  },
  {
    file: "img9.jpg",
    width: 1080,
    height: 1349,
    mood: "sakhob",
    title: "سكون مزعج / Disturbing Serenity",
    description:
      "لا شيء هنا كما يبدو للوهلة الأولى. الزاوية والتوقيت يمنحان المشهد منظوراً ساخراً ممّا اعتدنا تسميته حقيقة. فنّ يسائل لا يُجيب.",
  },
  {
    file: "img10.jpg",
    width: 1080,
    height: 1080,
    mood: "hamas",
    description:
      "حماس الجمع يتجمّد في إطار مربّع، والعدسة تُعيد ترتيب الفوضى الجميلة التي تصنعها الطاقة البشرية حين تجتمع في مكان واحد وتتّجه نحو هدف مشترك.",
  },
  {
    file: "img11.jpg",
    width: 1080,
    height: 1349,
    mood: "raiq",
    title: "عظمة",
    description:
      "تتصاعد الصورة رأسياً كما تتصاعد الأحلام؛ لا تعرف أين تنتهي السماء وأين يبدأ الحلم. مشهد رائق يقف على حافّة اللانهاية بكلّ هدوء.",
  },
  {
    file: "img12.jpeg",
    width: 1080,
    height: 720,
    mood: "hamas",
    title: "شرفة / verandah",
    description:
      "حركة لم تتوقّف لكنّها انتظرت العدسة. هذه اللحظة المُختارة بعناية تُجسّد روح الحماس في أنقى صورها: بلا تزييف ولا تصنّع.",
  },
  {
    file: "img13.jpeg",
    width: 1080,
    height: 864,
    mood: "sakhob",
    title: "سمكة المهرج / Clownfish",
    description:
      "تحتاج بعض الصور إلى وقفة أطول لاستيعاب ما تقوله. هذا المشهد يُخاطبك بلغة تتجاوز الكلمات، وتساؤلاته تظلّ حاضرة طويلاً بعد أن تُغلق الشاشة.",
  },
  {
    file: "img14.jpg",
    width: 1080,
    height: 771,
    mood: "raiq",
    title: "نقطة ارتكاز-fulcrum",
    description:
      "رائحة المكان تكاد تعبر الصورة؛ هواء منعش ومسافات تُحرّر الفكر من قيوده. لحظة من الحرية التامّة وُثّقت قبل أن تمضي إلى الأبد.",
  },
];

const PHOTOGRAPHER_TWO: {
  file: string;
  width: number;
  height: number;
  mood: PhotoMood;
  description: string;
  title?: string;
}[] = [
  {
    file: "img15.jpg",
    width: 1080,
    height: 720,
    mood: "raiq",
    description:
      "أفق أفقي يوسّع المشهد ويدعو العين إلى التجوّل في تفاصيله. لحظة هادئة تُوازن بين الاتساع والقرب.",
  },
  {
    file: "img16.jpg",
    width: 1080,
    height: 1080,
    mood: "hamas",
    description:
      "إيقاع مكثّف في إطار متوازن، كأنّ الطاقة تتجمّد لحظة قبل أن تنفجر. صورة تحمل حرارة اللحظة في صمتها.",
  },
  {
    file: "img17.jpg",
    width: 1080,
    height: 1080,
    mood: "sakhob",
    description:
      "تفاصيل تتقاطع في مربّع العدسة فتخلق توتراً بصرياً ممتعاً. ما يبدو بسيطاً يحمل في طيّاته مفاجأة بصرية.",
  },
  {
    file: "img18.jpeg",
    width: 1080,
    height: 699,
    mood: "raiq",
    description:
      "خط أفقي يقطع المشهد فيهدئ الإيقاع ويمنح العين مكاناً للراحة. سكون مصوَّر بعناية.",
  },
  {
    file: "img19.jpeg",
    width: 1080,
    height: 774,
    mood: "hamas",
    description:
      "لقطة تحمل زخماً خفياً؛ الضوء والظل يتقاسمان المشهد كأنهما يتنازعان على السيطرة على اللحظة.",
  },
];

export const allProjects: Project[] = [
  ...PHOTOGRAPHER_ONE.map(({ file, width, height, mood, description, title }, index) => ({
    slug: slugFor("photographerone", file),
    title: title ?? titleFor("photographerone", index + 1),
    description,
    src: photoPath("photographerone", file),
    photographerId: "photographerone" as const,
    mood,
    width,
    height,
  })),
  ...PHOTOGRAPHER_TWO.map(({ file, width, height, mood, description, title }, index) => ({
    slug: slugFor("photographertwo", file),
    title: title ?? titleFor("photographertwo", index + 1),
    description,
    src: photoPath("photographertwo", file),
    photographerId: "photographertwo" as const,
    mood,
    width,
    height,
  })),
];

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function projectsForPhotographer(
  slug: PhotographerSlug | null | undefined
): Project[] {
  if (!slug || !(slug in PHOTOGRAPHERS)) return allProjects;
  return allProjects.filter((p) => p.photographerId === slug);
}

/** Minimum items for the scroll gallery motion layers (7 slots). */
export const GALLERY_MOTION_MIN_ITEMS = 7;

/** All photos for a photographer; repeats from the start when count is below the gallery minimum. */
export function projectsForGalleryDisplay(
  slug: PhotographerSlug | null | undefined,
  minItems = GALLERY_MOTION_MIN_ITEMS
): Project[] {
  const base = projectsForPhotographer(slug);
  if (base.length === 0) return [];
  if (base.length >= minItems) return base;

  const expanded: Project[] = [];
  for (let i = 0; i < minItems; i++) {
    const p = base[i % base.length];
    const cycle = Math.floor(i / base.length);
    expanded.push({
      ...p,
      slug: cycle === 0 ? p.slug : `${p.slug}__g${cycle}-${i}`,
    });
  }
  return expanded;
}

export function parsePhotographerParam(
  raw: string | null | undefined
): PhotographerSlug | null {
  if (raw === "photographerone" || raw === "photographertwo") return raw;
  return null;
}

export function marqueeTitleFor(
  slug: PhotographerSlug | null | undefined
): string {
  if (!slug || !(slug in PHOTOGRAPHERS)) return GALLERY_ALL_MARQUEE;
  return PHOTOGRAPHERS[slug].marqueeTitle;
}
