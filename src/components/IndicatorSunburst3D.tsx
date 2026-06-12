import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getIndicatorSunburstInsight } from './ChartInsights';
import { useInView } from '../hooks/useInView';

// ── Short names & category colors ──
const shortNames: Record<string, string> = {
  'A1.1得分率': '班级数与班额数', 'A1.2得分率': '单一校区学生总数',
  'A2.1得分率': '卫生保健室配置', 'A2.2.1得分率': '食堂等级达标',
  'A2.2.2得分率': '校内小卖部达标', 'A2.3.1得分率': '饮用水卫生',
  'A2.3.2得分率': '厕所卫生', 'A3.1.2得分率': '出入口安全措施',
  'A3.1.1得分率': '危房情况', 'A3.2.1得分率': '保卫人员配备',
  'A3.2.2得分率': '宿舍管理员配备',
  'B1.2-①生均校舍建筑面积得分率': '生均校舍面积',
  'B1.2-②生均用地面积得分率': '生均用地面积',
  'B2.1-①校园办公用房面积得分率': '办公用房达标',
  'B2.1-②校园生活服务用房得分率': '生活用房达标',
  'B2.1-③住宿生床位配备得分率': '住宿生床位',
  'B3.1-①生均图书册数得分率': '生均图书册数',
  'B3.2-①图书资源配备得分率': '图书馆阅览室',
  'B4.1-①教学仪器设备配备得分率': '教学仪器设备',
  'B4.2-①音体美器材配备情况得分率': '音体美器材',
  'B5.1-①无线网覆盖得分率': '无线网覆盖',
  'B5.1-②师机比得分率': '师机比',
  'B5.1-③生机比得分率': '生机比',
  'B6.1-①体育运动场(馆)得分率': '体育运动场',
  'B6.1-②篮、排球场地得分率': '篮排球场地',
  'B6.1-③跑道长度得分率': '跑道长度',
  'B7.1-①生均绿地面积得分率': '生均绿地面积',
  'B1.1-②普通教室数得分率': '普通教室数',
  'B1.1-①得分率': '通风采光照明',
  'B1.1-③专用教室面积得分率': '专用教室面积',
  'B1.1-④公共教学用房得分率': '公共教学用房',
  'C1.1-①得分率': '教职工数达标', 'C1.3-①得分率': '骨干教师数',
  'C2.1-①得分率': '教师资格证', 'C3.1-①得分率': '教师培训时间',
  'C3.2-①得分率': '教师培训经费', 'C4.1-①得分率': '音体美教师',
  'C5.1-①得分率': '心理教师配备', 'C5.2-①得分率': '校医保健人员',
  'C6.1-①得分率': '学生体育活动', 'C6.2-①得分率': '体质健康测试',
  'C2.3-①得分率': '中高级职称教师', 'C2.2-①得分率': '专任教师学历',
  'C1.2-①得分率': '学校生师比',
};

const catColors: Record<string, THREE.Color> = {
  'A类-学校管理与安全': new THREE.Color('#4da8ff'),
  'B类-办学硬件与环境': new THREE.Color('#00d4ff'),
  'C类-师资队伍与发展': new THREE.Color('#a855f7'),
};

function getBarColor(avgRate: number, baseHue: THREE.Color): THREE.Color {
  if (avgRate < 0.5) return new THREE.Color('#ff5c5c');
  if (avgRate < 0.7) return new THREE.Color('#ff9f43');
  if (avgRate < 0.85) return new THREE.Color('#facc15');
  if (avgRate < 0.95) return new THREE.Color('#4ade80');
  return baseHue.clone();
}

export default function IndicatorSunburst3D({ data }: { data: DashboardData }) {
  const { ref: scrollRef, inView } = useInView({ threshold: 0.2 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const barMeshesRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number>(0);
  const groupRef = useRef<THREE.Group | null>(null);

  const getIntersects = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return [];
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.far = 20;
    raycaster.setFromCamera(mouse, cameraRef.current);
    return raycaster.intersectObjects(barMeshesRef.current);
  }, []);

  const updateTooltip = useCallback((event: MouseEvent) => {
    const intersects = getIntersects(event);
    if (intersects.length > 0) {
      const obj = intersects[0].object as THREE.Mesh;
      const label = obj.userData.label as string;
      const failCount = obj.userData.failCount as number;
      const avgRate = obj.userData.avgRate as number;
      if (label) {
        setTooltip({
          text: `${label}\n不达标: ${failCount}所 · 得分率: ${(avgRate * 100).toFixed(0)}%`,
          x: event.clientX,
          y: event.clientY,
        });
      }
    } else {
      setTooltip(null);
    }
  }, [getIntersects]);

  useEffect(() => {
    if (!inView || hasRendered.current || !containerRef.current) return;
    hasRendered.current = true;

    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Scene ──
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.8, 6.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x404060, 1.8));
    const dir1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dir1.position.set(5, 5, 5);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x4da8ff, 1.2);
    dir2.position.set(-3, -1, -3);
    scene.add(dir2);

    // ── Rotating group ──
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // ── Core sphere ──
    const coreGeo = new THREE.SphereGeometry(0.85, 64, 64);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x1a1f3a,
      emissive: 0x0a0e1a,
      shininess: 30,
      transparent: true,
      opacity: 0.85,
    });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    // ── Wireframe sphere ──
    const wireGeo = new THREE.SphereGeometry(1.02, 48, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x3a4a6a,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    group.add(new THREE.Mesh(wireGeo, wireMat));

    // ── Category rings ──
    const ringGeom = new THREE.TorusGeometry(1.05, 0.008, 16, 100);
    const catKeys = Object.keys(catColors);
    catKeys.forEach((cat, ci) => {
      const ring = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({
        color: catColors[cat], transparent: true, opacity: 0.5,
      }));
      const latAngle = (ci / (catKeys.length - 1) - 0.5) * Math.PI * 0.7;
      ring.position.y = Math.sin(latAngle) * 1.05;
      ring.scale.setScalar(Math.cos(latAngle));
      group.add(ring);
    });

    // ── Build bar data ──
    const indicators = data.indicators
      .filter(ind => ind.key !== '得分率' && ind.fail_count > 0)
      .sort((a, b) => b.fail_count - a.fail_count);

    const grouped: Record<string, typeof indicators> = {};
    for (const ind of indicators) {
      const cat = ind.category || '其他';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ind);
    }

    const maxFail = Math.max(...indicators.map(i => i.fail_count), 1);
    barMeshesRef.current = [];

    Object.entries(grouped).forEach(([cat, items], catIdx) => {
      const baseColor = catColors[cat] || new THREE.Color('#888');
      const baseLat = (catIdx / (Object.keys(grouped).length - 1 || 1) - 0.5) * Math.PI * 0.55;

      items.forEach((ind, itemIdx) => {
        const name = shortNames[ind.key] || ind.name;
        const color = getBarColor(ind.avg_rate, baseColor);
        const barHeight = 0.35 + (ind.fail_count / maxFail) * 1.6;
        const barRadius = 0.04 + (ind.fail_count / maxFail) * 0.06;

        const lat = baseLat + (Math.random() - 0.5) * 0.15;
        const lon = (itemIdx / items.length) * Math.PI * 2 + catIdx * 0.5;

        const direction = new THREE.Vector3(
          Math.cos(lat) * Math.cos(lon),
          Math.sin(lat),
          Math.cos(lat) * Math.sin(lon),
        ).normalize();

        // Cylinder bar
        const barGeo = new THREE.CylinderGeometry(barRadius, barRadius * 1.3, barHeight, 12);
        const barMat = new THREE.MeshPhongMaterial({
          color,
          emissive: color.clone().multiplyScalar(0.3),
          shininess: 60,
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.copy(direction.clone().multiplyScalar(1.05 + barHeight / 2));
        bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        bar.userData = {
          label: name,
          failCount: ind.fail_count,
          avgRate: ind.avg_rate,
          baseColor: color.getHex(),
        };
        group.add(bar);
        barMeshesRef.current.push(bar);

        // Glow cap
        const capGeo = new THREE.SphereGeometry(barRadius * 1.4, 8, 8);
        const capMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.copy(direction.clone().multiplyScalar(1.05 + barHeight + barRadius * 0.3));
        group.add(cap);
      });
    });

    // ── Ambient particles ──
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.7 + Math.random() * 1.2;
      posArray[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      posArray[i * 3 + 1] = Math.cos(phi) * r;
      posArray[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x4da8ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.Points(particlesGeo, particlesMat));

    // ── Mouse tooltip ──
    const handleMouseMove = (e: MouseEvent) => updateTooltip(e);
    window.addEventListener('mousemove', handleMouseMove);

    // ── Animation ──
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.003;
        groupRef.current.rotation.x += 0.0008;
      }
      const time = Date.now() * 0.001;
      barMeshesRef.current.forEach((bar, i) => {
        const bc = new THREE.Color(bar.userData.baseColor as number);
        const pulse = 1 + Math.sin(time * 2 + i * 0.5) * 0.15;
        (bar.material as THREE.MeshPhongMaterial).emissive.copy(bc).multiplyScalar(0.25 * pulse);
      });
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      barMeshesRef.current = [];
    };
  }, [inView, data, updateTooltip]);

  const insight = getIndicatorSunburstInsight(data);

  return (
    <FlipCard
      front={
        <div ref={scrollRef} className="card-border glow-cyan p-4 relative min-h-[520px]">
          <span className="flip-hint" title="点击空白处翻转查看结论">⇄</span>
          <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <span className="text-accent-cyan">🌐</span>
            不达标指标空间分布
          </h3>

          <div ref={containerRef} style={{ width: '100%', height: '420px', cursor: 'grab' }} />

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-[#161b2e]/95 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#e8eaed] whitespace-pre-line shadow-lg"
              style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
            >
              {tooltip.text}
            </div>
          )}

          <div className="flex gap-3 mt-2 text-xs text-text-muted justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#ff5c5c]" /> 严重 (&lt;50%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#ff9f43]" /> 较差 (50-70%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#facc15]" /> 一般 (70-85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#4ade80]" /> 良好 (&ge;85%)
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="text-[10px]">💡 柱高=不达标学校数 颜色=得分率等级</span>
            </span>
          </div>
        </div>
      }
      back={<InsightBack insight={insight} />}
    />
  );
}
