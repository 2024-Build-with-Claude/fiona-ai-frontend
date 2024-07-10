import { SectionKey } from "@reactive-resume/schema";
import { pageSizeMap, Template } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { MM_TO_PX, Page } from "../components/page";
import { useArtboardStore } from "../store/artboard";
import { getTemplate } from "../templates";

const MOBILE_BREAKPOINT = 768;
const MARGIN_PERCENTAGE = 0.05; // 5% margin around the paper

export const BuilderLayout = () => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const format = useArtboardStore((state) => state.resume.metadata.page.format);
  const layout = useArtboardStore((state) => state.resume.metadata.layout);
  const template = useArtboardStore((state) => state.resume.metadata.template as Template);
  const [initialScale, setInitialScale] = useState(0.5);
  const [isMobile, setIsMobile] = useState(false);

  const Template = useMemo(() => getTemplate(template), [template]);

  useEffect(() => {
    const calculateInitialScale = () => {
      const pageWidth = pageSizeMap[format].width * MM_TO_PX;
      const pageHeight = pageSizeMap[format].height * MM_TO_PX;
      const viewportWidth = window.innerWidth * (1 - MARGIN_PERCENTAGE * 2);
      const viewportHeight = window.innerHeight * (1 - MARGIN_PERCENTAGE * 2) - 60; // Subtracting header height
      const scaleX = viewportWidth / pageWidth;
      const scaleY = viewportHeight / pageHeight;
      return Math.min(scaleX, scaleY, 0.6); // Limit max scale to 0.6 for a more zoomed-out view
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      setInitialScale(calculateInitialScale());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [format]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "ZOOM_IN") transformRef.current?.zoomIn(0.2);
      if (event.data.type === "ZOOM_OUT") transformRef.current?.zoomOut(0.2);
      if (event.data.type === "CENTER_VIEW") transformRef.current?.centerView();
      if (event.data.type === "RESET_VIEW") {
        transformRef.current?.resetTransform();
        setTimeout(() => transformRef.current?.centerView(isMobile ? initialScale : 0.7, 0), 10);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [initialScale]);

  useEffect(() => {
    if (isMobile) {
      // Ensure the page is centered on mobile
      setTimeout(() => {
        const pageWidth = pageSizeMap[format].width * MM_TO_PX;
        const pageHeight = pageSizeMap[format].height * MM_TO_PX;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 60; // Subtracting header height
        const xOffset = viewportWidth - (pageWidth * initialScale) / 1.25;
        const yOffset = (viewportHeight - pageHeight * initialScale) / 3;
        transformRef.current?.setTransform(xOffset, yOffset, initialScale, 500, "easeOut");
      }, 100);
    } else {
      // Center the page vertically for desktop
      setTimeout(() => {
        const pageHeight = pageSizeMap[format].height * MM_TO_PX;
        const viewportHeight = window.innerHeight - 60; // Subtracting header height
        const yOffset = (viewportHeight - pageHeight * 0.7) / 2;
        transformRef.current?.setTransform(0, yOffset, 0.7, 500, "easeOut");
      }, 100);
    }
  }, [isMobile, initialScale, format]);

  return (
    <TransformWrapper
      ref={transformRef}
      initialScale={isMobile ? initialScale : 0.7}
      minScale={isMobile ? 0.1 : 0.4}
      maxScale={2}
      limitToBounds={false}
      centerOnInit={true}
    >
      <TransformComponent
        wrapperClass="flex-grow !w-full"
        contentClass="flex items-center justify-center h-full"
        contentStyle={{
          width: "100%",
          height: "100%",
          padding: `${MARGIN_PERCENTAGE * 100}%`,
        }}
      >
        <AnimatePresence>
          {layout.map((columns, pageIndex) => (
            <motion.div
              key={pageIndex}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: pageIndex * 0.2 } }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={isMobile ? "mr-2" : "mr-4"}
            >
              <Page mode="builder" pageNumber={pageIndex + 1}>
                <Template isFirstPage={pageIndex === 0} columns={columns as SectionKey[][]} />
              </Page>
            </motion.div>
          ))}
        </AnimatePresence>
      </TransformComponent>
    </TransformWrapper>
  );
};
