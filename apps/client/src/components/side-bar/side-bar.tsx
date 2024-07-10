import "./side-bar.css";

import { CopyOutlined, RightOutlined, SolutionOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Popover } from "antd";
import { CheckList } from "antd-mobile";
import { CheckListValue } from "antd-mobile/es/components/check-list";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";

import { queryClient } from "@/client/libs/query-client";
import { ExportSection } from "@/client/pages/builder/sidebars/right/sections/export";
import { LayoutSection } from "@/client/pages/builder/sidebars/right/sections/layout";
import { TemplateSection } from "@/client/pages/builder/sidebars/right/sections/template";
import { findResumeById, useResumes } from "@/client/services/resume";
import { useResumeStore } from "@/client/stores/resume";

import { menuItems } from "./const";
import DrawerWrapper from "./drawer-wrapper";
import IndustryIcon from "./industry-icon";
import { MenuItem, SecondLevelItemProps, ThirdLevelMenuProps } from "./typings";

const { Sider } = Layout;
const { SubMenu } = Menu;
const handleSave = (e: React.MouseEvent) => {
  e.stopPropagation();
};

const ThirdLevelMenu: React.FC<ThirdLevelMenuProps> = ({ items, title }) => {
  const [checkedValues, setCheckedValues] = useState<CheckListValue[]>([]);

  const handleCheckListChange = (values: CheckListValue[]) => {
    setCheckedValues(values);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedValues(items.map((item) => item.key));
  };

  const handleDeselectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedValues([]);
  };

  return (
    <div
      className="third-level-menu"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="third-level-header">
        <span>{title}</span>
        <Button onClick={handleSave}>儲存</Button>
      </div>
      <div className="select-buttons">
        <Button htmlType="button" onClick={handleSelectAll}>
          全選
        </Button>
        <Button htmlType="button" onClick={handleDeselectAll}>
          取消全選
        </Button>
      </div>
      <CheckList multiple value={checkedValues} onChange={handleCheckListChange}>
        {items.map((item) => (
          <CheckList.Item key={item.key} value={item.key} style={{ minWidth: "200px" }}>
            {item.label}
          </CheckList.Item>
        ))}
      </CheckList>
    </div>
  );
};

const SecondLevelItem: React.FC<SecondLevelItemProps> = ({
  item,
  openKey,
  isMobile,
  handleThirdLevelItemClick,
  handleSecondLevelItemClick,
}) => {
  const isOpen = openKey === item.key;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSecondLevelItemClick(item.key);
  };

  const content = (
    <ThirdLevelMenu
      items={item.children || []}
      title={item.label}
      onItemClick={handleThirdLevelItemClick}
    />
  );

  if (isMobile) {
    return (
      <>
        <div className={`second-level-item ${isOpen ? "active" : ""}`} onClick={handleClick}>
          {item.label}
          <RightOutlined className="submenu-arrow" rotate={isOpen ? 90 : 0} />
        </div>
        {isOpen && item.children && content}
      </>
    );
  }

  return (
    <Popover
      content={content}
      trigger="click"
      placement="rightTop"
      overlayClassName="custom-popover"
      open={isOpen}
      onOpenChange={(open) => handleSecondLevelItemClick(open ? item.key : "")}
    >
      <div className={`second-level-item ${isOpen ? "active" : ""}`} onClick={handleClick}>
        {item.label}
        <RightOutlined className="submenu-arrow" rotate={isOpen ? 90 : 0} />
      </div>
    </Popover>
  );
};

const NestedSidebar: React.FC<PropsWithChildren> = ({ children }) => {
  const [openKeys, setOpenKeys] = useState<string[]>(["sub1"]);
  const [openSecondLevel, setOpenSecondLevel] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(200); // 初始宽度
  const sidebarRef = useRef<HTMLDivElement>(null);
  // useResumeStore.setState({ resume: tempMockLayoutData as ResumeDto });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const onOpenChange = (keys: string[]) => {
    console.log(keys);
    setOpenKeys(keys);
  };

  const handleSecondLevelItemClick = (key: string) => {
    // onOpenChange([key]);
    setOpenSecondLevel(openSecondLevel === key ? "" : key);
    setSelectedKeys([key]);
  };

  const handleThirdLevelItemClick = (itemKey: string) => {
    setOpenSecondLevel("");
    setSelectedKeys([itemKey]);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
  };

  const resize = (e: MouseEvent) => {
    if (sidebarRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        // 设置最大最小宽度
        setSidebarWidth(newWidth);
      }
    }
  };

  const stopResizing = () => {
    window.removeEventListener("mousemove", resize);
    window.removeEventListener("mouseup", stopResizing);
  };

  const { resumes } = useResumes();
  const resume = useResumeStore((state) => state.resume);
  const chatState = useResumeStore((state) => state.chatBotState);

  const renderMenuItem = (item: MenuItem) => {
    if (isMobile) {
      return (
        <SubMenu key={item.key} title={item.label}>
          {item.children && (
            <ThirdLevelMenu
              items={item.children}
              title={item.label}
              onItemClick={handleThirdLevelItemClick}
            />
          )}
        </SubMenu>
      );
    }

    return (
      <Menu.Item key={item.key} className="second-level-container">
        <SecondLevelItem
          item={item}
          openKey={openSecondLevel}
          isMobile={isMobile}
          handleThirdLevelItemClick={handleThirdLevelItemClick}
          handleSecondLevelItemClick={handleSecondLevelItemClick}
        />
      </Menu.Item>
    );
  };

  useEffect(() => {
    if (
      chatState === "resume-preview" &&
      resumes &&
      resumes.length > 0 &&
      !selectedKeys.some((item) => resumes.map((item) => item.id).includes(item))
    ) {
      const resumeId = resumes[0].id;
      setSelectedKeys((prev) => [...prev, resumeId]);
      queryClient
        .fetchQuery({
          queryKey: ["resume", { id: resumeId }],
          queryFn: () => findResumeById({ id: resumeId }),
        })
        .then((res) => {
          useResumeStore.setState({ resume: res });
          useResumeStore.temporal.getState().clear();
        })
        .catch(() => {
          // eslint-disable-next-line lingui/no-unlocalized-strings
          console.error("Failed to fetch resume");
        });
    }
  }, [chatState]);

  return (
    <DrawerWrapper
      sidebar={
        <div ref={sidebarRef} style={{ display: "flex", height: "100%" }}>
          <Sider width={isMobile ? "100%" : sidebarWidth} className="custom-sider">
            <Menu
              mode="inline"
              openKeys={openKeys}
              selectedKeys={selectedKeys}
              expandIcon={({ isOpen }) => <RightOutlined rotate={isOpen ? 90 : 0} />}
              onOpenChange={onOpenChange}
              onSelect={({ key }) => {
                setSelectedKeys([key]);
              }}
            >
              <SubMenu
                key="parent1"
                icon={<IndustryIcon style={{ color: "#7077f3" }} />}
                title="industry"
              >
                {menuItems.map((element) => renderMenuItem(element))}
              </SubMenu>
              <SubMenu
                key="parent2"
                icon={<SolutionOutlined style={{ color: "#7077f3", fontSize: "20px" }} />}
                // eslint-disable-next-line lingui/no-unlocalized-strings
                title="my resume"
              >
                {(resumes ?? []).map((resume) => (
                  <Menu.Item
                    key={resume.id}
                    onClick={async (e) => {
                      const id = e.key;
                      const resume = await queryClient.fetchQuery({
                        queryKey: ["resume", { id }],
                        queryFn: () => findResumeById({ id }),
                      });

                      useResumeStore.setState({ resume });
                      useResumeStore.temporal.getState().clear();
                    }}
                  >
                    {resume.title}
                  </Menu.Item>
                ))}
              </SubMenu>
              <SubMenu
                key="parent"
                icon={<CopyOutlined style={{ color: "#7077f3", fontSize: "20px" }} />}
                title="template"
              >
                {Object.keys(resume).length > 0 && <TemplateSection />}
              </SubMenu>
              <SubMenu
                key="parent4"
                icon={<CopyOutlined style={{ color: "#7077f3", fontSize: "20px" }} />}
                title="setting"
              >
                {Object.keys(resume).length > 0 && (
                  <>
                    <ExportSection />
                    <LayoutSection />
                  </>
                )}
              </SubMenu>
            </Menu>
          </Sider>
          <div className="resizer-container" onMouseDown={startResizing}>
            <div className="resizer"></div>
          </div>
        </div>
      }
    >
      {children}
    </DrawerWrapper>
  );
};

export default NestedSidebar;
