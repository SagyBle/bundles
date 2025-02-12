export interface BundleOptionSelection {
  componentOptionId: string;
  name: string;
  values: string[];
}

export interface BundleComponent {
  quantity: number;
  productId: string;
  optionSelections: BundleOptionSelection[];
}

export interface CreateBundleInput {
  title: string;
  components: BundleComponent[];
}
