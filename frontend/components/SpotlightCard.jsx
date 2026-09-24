import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function SpotlightCard({ children, className = "" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`spotlight-container relative ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      <div
        className="spotlight"
        style={{ left: pos.x, top: pos.y, opacity }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}