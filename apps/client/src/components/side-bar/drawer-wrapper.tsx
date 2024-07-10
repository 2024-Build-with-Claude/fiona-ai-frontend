import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import React, { useEffect, useState } from "react";

type DrawerWrapperProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

const DrawerWrapper: React.FC<DrawerWrapperProps> = ({ sidebar, children }) => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // 初始化為 null

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

  // 確保在 isMobile 還是 null 的情況下不渲染任何內容
  if (isMobile === null) {
    return null; // 或者可以返回一個 loading 狀態的組件
  }

  return (
    <>
      {isMobile && (
        <Button
          icon={<MenuOutlined />}
          className="drawer-button"
          onClick={() => {
            setDrawerVisible(true);
          }}
        />
      )}
      {isMobile ? (
        <>
          <Drawer
            title=""
            placement="left"
            closable={true}
            open={drawerVisible}
            width="100%"
            onClose={() => {
              setDrawerVisible(false);
            }}
          >
            {sidebar}
          </Drawer>
          <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
        </>
      ) : (
        <div style={{ display: "flex" }}>
          {sidebar}
          <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
        </div>
      )}
    </>
  );
};

export default DrawerWrapper;
