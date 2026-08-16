import { ContactPageTemplate } from './ContactPageTemplate';
import { EditorialPageTemplate } from './EditorialPageTemplate';
import { GiftFinderPageTemplate } from './GiftFinderPageTemplate';
import { HeroPageTemplate } from './HeroPageTemplate';
import { HomepageTemplate } from './HomepageTemplate';
import { StandardPageTemplate } from './StandardPageTemplate';

export const pageTemplateComponents = {
  homepage: HomepageTemplate,
  standard: StandardPageTemplate,
  hero: HeroPageTemplate,
  editorial: EditorialPageTemplate,
  contact: ContactPageTemplate,
  'gift-finder': GiftFinderPageTemplate
};

export function getPageTemplateComponent(template) {
  return pageTemplateComponents[template] || StandardPageTemplate;
}
