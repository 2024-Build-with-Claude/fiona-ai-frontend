export type SecondLevelItemProps = {
  item: {
    key: string;
    label: string;
    children?: { key: string; label: string }[];
  };
  openKey: string;
  isMobile: boolean;
  handleThirdLevelItemClick: (key: string) => void;
  handleSecondLevelItemClick: (key: string) => void;
};

export type ThirdLevelMenuProps = {
  items: { key: string; label: string }[];
  onItemClick: (key: string) => void;
  title: string;
};

export type MenuItem = {
  key: string;
  label: string;
  children?: MenuItem[];
};
