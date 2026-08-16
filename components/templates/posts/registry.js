import { FeaturePostTemplate } from './FeaturePostTemplate';
import { GuidePostTemplate } from './GuidePostTemplate';
import { MinimalPostTemplate } from './MinimalPostTemplate';
import { StandardPostTemplate } from './StandardPostTemplate';

export const postTemplateComponents = {
  standard: StandardPostTemplate,
  feature: FeaturePostTemplate,
  guide: GuidePostTemplate,
  minimal: MinimalPostTemplate
};

export function getPostTemplateComponent(template) {
  return postTemplateComponents[template] || StandardPostTemplate;
}
