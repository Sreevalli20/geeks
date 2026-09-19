import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
  FolderKanban,
  FileCheck2,
  Terminal,
  ClipboardCheck,
  User,
  Info,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { EvidenceRelationship } from '../types';

export type NodeType =
  | 'Candidate'
  | 'Claim'
  | 'Skill'
  | 'Project'
  | 'Evidence'
  | 'Assessment'
  | 'Challenge';

export type RelationKind = 'claims' | 'supports' | 'conflicts_with' | 'verified_by';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  subLabel?: string;
  category?: string;
  status: string;
  confidence?: number;
  source?: string;
  details?: string;
  rawEntity?: any;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: RelationKind;
  confidence?: number;
  explanation?: string;
}

export const EvidenceGraphPage: React.FC = () => {
  const {
    candidates,
    activeCandidate,
    setActiveCandidateId,
    claims,
    skills,
    projects,
    evidence,
    assessments,
    challenges,
    submissions,
    setPreviewEvidence,
    navigateTo,
  } = useApp();

  // Canvas Viewport Pan and Zoom state
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Selection and Interaction
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTypeFilters, setActiveTypeFilters] = useState<Record<NodeType, boolean>>({
    Candidate: true,
    Claim: true,
    Skill: true,
    Project: true,
    Evidence: true,
    Assessment: true,
    Challenge: true,
  });
  const [activeRelationFilter, setActiveRelationFilter] = useState<string>('ALL');
  const [onlyConflicts, setOnlyConflicts] = useState<boolean>(false);

  // SVG ref
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Dragging individual nodes state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [customNodePositions, setCustomNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // ---------------------------------------------------------------------------
  // Build dynamic Graph Nodes and Edges based on active Candidate
  // ---------------------------------------------------------------------------
  const { nodes, edges } = useMemo(() => {
    if (!activeCandidate) return { nodes: [], edges: [] };

    const candClaims = claims.filter((c) => c.candidateId === activeCandidate.id);
    const candSkills = skills.filter((s) => s.candidateId === activeCandidate.id);
    const candProjects = projects.filter((p) => p.candidateId === activeCandidate.id);
    const candEvidence = evidence.filter((e) => e.candidateId === activeCandidate.id);
    const candAssessments = assessments.filter((a) => a.candidateId === activeCandidate.id);

    const candChallenges = challenges.filter((chal) =>
      candSkills.some((s) => s.name.toLowerCase() === chal.skillTested.toLowerCase())
    );

    const generatedNodes: GraphNode[] = [];
    const generatedEdges: GraphEdge[] = [];

    // Helper for vertical spacing in layered columns
    const COLUMN_X: Record<NodeType, number> = {
      Candidate: 80,
      Claim: 440,
      Skill: 800,
      Project: 1160,
      Evidence: 1520,
      Assessment: 1900,
      Challenge: 1900,
    };

    // 1. Candidate Node
    generatedNodes.push({
      id: activeCandidate.id,
      type: 'Candidate',
      label: activeCandidate.name,
      subLabel: activeCandidate.detectedRole,
      status: 'SUPPORTED',
      source: 'Verified Talent Dossier',
      details: activeCandidate.summary,
      rawEntity: activeCandidate,
      x: COLUMN_X.Candidate,
      y: 350,
    });

    // 2. Claim Nodes
    candClaims.forEach((c, idx) => {
      const ySpacing = Math.max(80, 700 / (candClaims.length || 1));
      generatedNodes.push({
        id: c.id,
        type: 'Claim',
        label: c.title,
        subLabel: c.claimType,
        category: c.claimType,
        status: c.evidenceStatus,
        source: c.source,
        details: c.description,
        rawEntity: c,
        x: COLUMN_X.Claim,
        y: 80 + idx * ySpacing,
      });

      // Edge: Candidate -> Claim (Relationship: claims)
      generatedEdges.push({
        id: `edge-cand-${c.id}`,
        sourceId: activeCandidate.id,
        targetId: c.id,
        relationship: 'claims',
        confidence: 100,
        explanation: `${activeCandidate.name} declared this statement in uploaded resume.`,
      });
    });

    // 3. Skill Nodes
    candSkills.forEach((s, idx) => {
      const ySpacing = Math.max(90, 750 / (candSkills.length || 1));
      generatedNodes.push({
        id: s.id,
        type: 'Skill',
        label: s.name,
        subLabel: s.category,
        category: s.category,
        status: s.verificationState,
        source: `Evidence Count: ${s.evidenceCount}`,
        details: s.missingProofReason || 'Competency evaluated against code samples and tests.',
        rawEntity: s,
        x: COLUMN_X.Skill,
        y: 80 + idx * ySpacing,
      });

      // Connect Claims to Skills (Relationship: claims or supports)
      candClaims.forEach((c) => {
        if (
          c.title.toLowerCase().includes(s.name.toLowerCase()) ||
          c.description.toLowerCase().includes(s.name.toLowerCase())
        ) {
          generatedEdges.push({
            id: `edge-claim-${c.id}-${s.id}`,
            sourceId: c.id,
            targetId: s.id,
            relationship: 'claims',
            confidence: 90,
            explanation: `Claim asserts proficiency in ${s.name}.`,
          });
        }
      });
    });

    // 4. Project Nodes
    candProjects.forEach((p, idx) => {
      const ySpacing = Math.max(140, 600 / (candProjects.length || 1));
      generatedNodes.push({
        id: p.id,
        type: 'Project',
        label: p.name,
        subLabel: p.role || 'Portfolio Project',
        category: 'Project',
        status: p.verificationStatus,
        source: p.repoUrl || 'Portfolio Repository',
        details: p.description,
        rawEntity: p,
        x: COLUMN_X.Project,
        y: 120 + idx * ySpacing,
      });

      // Connect Projects to Skills (Relationship: supports)
      p.claimedSkills.forEach((skName) => {
        const matchingSkill = candSkills.find(
          (s) => s.name.toLowerCase() === skName.toLowerCase()
        );
        if (matchingSkill) {
          generatedEdges.push({
            id: `edge-proj-${p.id}-${matchingSkill.id}`,
            sourceId: p.id,
            targetId: matchingSkill.id,
            relationship: 'supports',
            confidence: 92,
            explanation: `Project implementation exhibits real-world ${skName} usage.`,
          });
        }
      });
    });

    // 5. Evidence Nodes
    candEvidence.forEach((ev, idx) => {
      const ySpacing = Math.max(90, 750 / (candEvidence.length || 1));
      generatedNodes.push({
        id: ev.id,
        type: 'Evidence',
        label: ev.filename,
        subLabel: ev.evidenceType,
        category: ev.evidenceType,
        status: ev.status,
        confidence: ev.confidenceScore,
        source: ev.source,
        details: ev.extractionSnippet || ev.conflicts || 'Evidence artifact extracted and indexed.',
        rawEntity: ev,
        x: COLUMN_X.Evidence,
        y: 60 + idx * ySpacing,
      });

      // Check for conflicts
      const isConflicting = ev.status === 'CONFLICTING' || !!ev.conflicts;

      // Connect Evidence to Skills
      ev.relatedSkillIds.forEach((skillId) => {
        const skill = candSkills.find((s) => s.id === skillId);
        if (skill) {
          generatedEdges.push({
            id: `edge-ev-${ev.id}-${skillId}`,
            sourceId: ev.id,
            targetId: skillId,
            relationship: isConflicting ? 'conflicts_with' : 'supports',
            confidence: ev.confidenceScore || 90,
            explanation: isConflicting
              ? `Evidence contradicts stated claim level for ${skill.name}.`
              : `Technical artifact demonstrates direct proficiency in ${skill.name}.`,
          });
        }
      });

      // Connect Evidence to Claims (if specified or conflicting)
      candClaims.forEach((cl) => {
        if (cl.evidenceIds.includes(ev.id)) {
          generatedEdges.push({
            id: `edge-ev-claim-${ev.id}-${cl.id}`,
            sourceId: ev.id,
            targetId: cl.id,
            relationship: isConflicting ? 'conflicts_with' : 'supports',
            confidence: ev.confidenceScore || 90,
            explanation: isConflicting
              ? `Artifact discrepancy: ${ev.conflicts || 'Contradicts declared claim.'}`
              : `Artifact provides primary verification support for this claim.`,
          });
        }
      });

      // Connect Evidence to Projects
      ev.relatedProjectIds.forEach((projId) => {
        generatedEdges.push({
          id: `edge-ev-proj-${ev.id}-${projId}`,
          sourceId: ev.id,
          targetId: projId,
          relationship: 'supports',
          confidence: 95,
          explanation: `Artifact originates from this verified repository.`,
        });
      });
    });

    // 6. Assessment Nodes
    candAssessments.forEach((ass, idx) => {
      generatedNodes.push({
        id: ass.id,
        type: 'Assessment',
        label: ass.title,
        subLabel: `${ass.score ?? 94}/100 • ${ass.category}`,
        category: ass.category,
        status: 'SUPPORTED',
        confidence: ass.score ?? 94,
        source: `Evaluation Date: ${ass.date}`,
        details: ass.scoreExplainable,
        rawEntity: ass,
        x: COLUMN_X.Assessment,
        y: 80 + idx * 160,
      });

      // Relationship: Skill -> Assessment (verified_by)
      ass.verifiedSkills.forEach((vSkill) => {
        const matchingSkill = candSkills.find(
          (s) => s.name.toLowerCase() === vSkill.toLowerCase()
        );
        if (matchingSkill) {
          generatedEdges.push({
            id: `edge-ass-skill-${ass.id}-${matchingSkill.id}`,
            sourceId: matchingSkill.id,
            targetId: ass.id,
            relationship: 'verified_by',
            confidence: ass.score ?? 94,
            explanation: `Skill benchmarked and certified via ${ass.title}.`,
          });
        }
      });
    });

    // 7. Practical Challenge Nodes
    candChallenges.forEach((chal, idx) => {
      const submission = submissions.find(
        (sub) => sub.challengeId === chal.id && sub.candidateId === activeCandidate.id
      );
      const isCompleted = !!submission;

      generatedNodes.push({
        id: chal.id,
        type: 'Challenge',
        label: chal.title,
        subLabel: `${chal.difficulty} • ${chal.skillTested}`,
        category: chal.difficulty,
        status: isCompleted ? 'SUPPORTED' : 'UNVERIFIED',
        confidence: submission?.scorePercentage,
        source: 'Practical Coding Sandbox',
        details: chal.whyRecommended,
        rawEntity: chal,
        x: COLUMN_X.Challenge,
        y: 320 + idx * 140,
      });

      // Relationship: Skill -> Challenge (verified_by)
      const matchingSkill = candSkills.find(
        (s) => s.name.toLowerCase() === chal.skillTested.toLowerCase()
      );
      if (matchingSkill) {
        generatedEdges.push({
          id: `edge-chal-skill-${chal.id}-${matchingSkill.id}`,
          sourceId: matchingSkill.id,
          targetId: chal.id,
          relationship: 'verified_by',
          confidence: isCompleted ? (submission.scorePercentage || 95) : 50,
          explanation: isCompleted
            ? `Candidate completed practical coding challenge with score ${submission.scorePercentage}%.`
            : `Challenge recommended to evaluate real-time capability in ${chal.skillTested}.`,
        });
      }
    });

    // Apply custom positions if user dragged any node
    const finalNodes = generatedNodes.map((n) => {
      if (customNodePositions[n.id]) {
        return {
          ...n,
          x: customNodePositions[n.id].x,
          y: customNodePositions[n.id].y,
        };
      }
      return n;
    });

    return { nodes: finalNodes, edges: generatedEdges };
  }, [
    activeCandidate,
    claims,
    skills,
    projects,
    evidence,
    assessments,
    challenges,
    submissions,
    customNodePositions,
  ]);

  // Set initial selected node
  useEffect(() => {
    if (!selectedNodeId && nodes.length > 0) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  // ---------------------------------------------------------------------------
  // Highlighting & Connected Sub-graph logic
  // ---------------------------------------------------------------------------
  const activeFocusId = hoveredNodeId || selectedNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const set = new Set<string>();
    set.add(activeFocusId);

    edges.forEach((edge) => {
      if (edge.sourceId === activeFocusId) set.add(edge.targetId);
      if (edge.targetId === activeFocusId) set.add(edge.sourceId);
    });

    return set;
  }, [activeFocusId, edges]);

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const set = new Set<string>();

    edges.forEach((edge) => {
      if (edge.sourceId === activeFocusId || edge.targetId === activeFocusId) {
        set.add(edge.id);
      }
    });

    return set;
  }, [activeFocusId, edges]);

  // Filtered nodes based on Type, Search Query, and Conflict status
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Type filter
      if (!activeTypeFilters[node.type]) return false;

      // Conflict-only filter
      if (onlyConflicts && node.status !== 'Conflicting' && node.status !== 'CONFLICTING') {
        const hasConflictEdge = edges.some(
          (e) =>
            e.relationship === 'conflicts_with' &&
            (e.sourceId === node.id || e.targetId === node.id)
        );
        if (!hasConflictEdge) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = node.label.toLowerCase().includes(q);
        const matchSub = (node.subLabel || '').toLowerCase().includes(q);
        const matchCategory = (node.category || '').toLowerCase().includes(q);
        if (!matchLabel && !matchSub && !matchCategory) return false;
      }

      return true;
    });
  }, [nodes, activeTypeFilters, onlyConflicts, searchQuery, edges]);

  const visibleNodeIdSet = useMemo(() => {
    return new Set(visibleNodes.map((n) => n.id));
  }, [visibleNodes]);

  // Filtered edges
  const visibleEdges = useMemo(() => {
    return edges.filter((edge) => {
      if (!visibleNodeIdSet.has(edge.sourceId) || !visibleNodeIdSet.has(edge.targetId)) {
        return false;
      }
      if (activeRelationFilter !== 'ALL' && edge.relationship !== activeRelationFilter) {
        return false;
      }
      if (onlyConflicts && edge.relationship !== 'conflicts_with') {
        return false;
      }
      return true;
    });
  }, [edges, visibleNodeIdSet, activeRelationFilter, onlyConflicts]);

  // Currently Selected Node Details
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Incoming and Outgoing connections for selected node
  const selectedIncoming = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.targetId === selectedNode.id)
      .map((e) => ({
        edge: e,
        connectedNode: nodes.find((n) => n.id === e.sourceId),
      }))
      .filter((item) => !!item.connectedNode);
  }, [selectedNode, edges, nodes]);

  const selectedOutgoing = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.sourceId === selectedNode.id)
      .map((e) => ({
        edge: e,
        connectedNode: nodes.find((n) => n.id === e.targetId),
      }))
      .filter((item) => !!item.connectedNode);
  }, [selectedNode, edges, nodes]);

  // ---------------------------------------------------------------------------
  // Canvas Pan & Zoom Handlers
  // ---------------------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on node or inspector, don't drag canvas
    if ((e.target as HTMLElement).closest('.graph-node-element')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      // Node dragging
      const rect = svgContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseSvgX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseSvgY = (e.clientY - rect.top - pan.y) / zoom;

      setCustomNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: Math.round(mouseSvgX), y: Math.round(mouseSvgY) },
      }));
      return;
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.35, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 30 });
    setCustomNodePositions({});
  };

  const fitToView = () => {
    setZoom(0.65);
    setPan({ x: 20, y: 20 });
  };

  if (!activeCandidate || nodes.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <EmptyState
          title="NO GRAPH DATA"
          description="Upload a candidate resume or select a candidate to generate the connected Evidence Trace Graph."
        />
      </div>
    );
  }

  // Color mapping helper for node types
  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'Candidate':
        return { bg: 'fill-slate-900', stroke: '#0f172a', text: '#ffffff', tag: 'bg-slate-900 text-white' };
      case 'Claim':
        return { bg: 'fill-indigo-50', stroke: '#6366f1', text: '#312e81', tag: 'bg-indigo-100 text-indigo-800' };
      case 'Skill':
        return { bg: 'fill-emerald-50', stroke: '#10b981', text: '#064e3b', tag: 'bg-emerald-100 text-emerald-800' };
      case 'Project':
        return { bg: 'fill-sky-50', stroke: '#0ea5e9', text: '#0c4a6e', tag: 'bg-sky-100 text-sky-800' };
      case 'Evidence':
        return { bg: 'fill-amber-50', stroke: '#f59e0b', text: '#78350f', tag: 'bg-amber-100 text-amber-900' };
      case 'Assessment':
        return { bg: 'fill-purple-50', stroke: '#a855f7', text: '#581c87', tag: 'bg-purple-100 text-purple-800' };
      case 'Challenge':
        return { bg: 'fill-violet-50', stroke: '#8b5cf6', text: '#4c1d95', tag: 'bg-violet-100 text-violet-800' };
    }
  };

  // Relationship styling helper
  const getRelationStyle = (rel: RelationKind) => {
    switch (rel) {
      case 'claims':
        return { color: '#6366f1', strokeDash: '', label: 'claims', bg: 'bg-indigo-100 text-indigo-800' };
      case 'supports':
        return { color: '#10b981', strokeDash: '', label: 'supports', bg: 'bg-emerald-100 text-emerald-800' };
      case 'conflicts_with':
        return { color: '#f43f5e', strokeDash: '6 4', label: 'conflicts_with', bg: 'bg-rose-100 text-rose-800 font-bold' };
      case 'verified_by':
        return { color: '#a855f7', strokeDash: '', label: 'verified_by', bg: 'bg-purple-100 text-purple-800' };
    }
  };

  return (
    <div id="evidence-graph-page" className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-100/70">
      {/* Top Controls & Filter Ribbon */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-black text-slate-950 tracking-tight">Interactive Evidence Graph</h1>
          </div>

          {/* Candidate Switcher if multiple */}
          {candidates.length > 1 && (
            <select
              value={activeCandidate.id}
              onChange={(e) => setActiveCandidateId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-hidden"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.detectedRole})
                </option>
              ))}
            </select>
          )}

          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono font-medium text-slate-600 border border-slate-200">
            <span>{visibleNodes.length} Nodes</span>
            <span>•</span>
            <span>{visibleEdges.length} Links</span>
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-400 w-36 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Relationship Filter */}
          <select
            value={activeRelationFilter}
            onChange={(e) => setActiveRelationFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-hidden font-medium"
          >
            <option value="ALL">All Relationships</option>
            <option value="claims">claims</option>
            <option value="supports">supports</option>
            <option value="conflicts_with">conflicts_with</option>
            <option value="verified_by">verified_by</option>
          </select>

          {/* Highlight Conflict Toggle */}
          <button
            onClick={() => setOnlyConflicts((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              onlyConflicts
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyConflicts ? 'text-white' : 'text-rose-600'}`} />
            <span>Conflict Filter</span>
          </button>

          {/* Profile Quick Link */}
          <button
            onClick={() => navigateTo('candidate-profile')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Candidate Profile</span>
          </button>
        </div>
      </div>

      {/* Node Type Visibility Pill Filters */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 shrink-0">Filter Nodes:</span>
        {(['Candidate', 'Claim', 'Skill', 'Project', 'Evidence', 'Assessment', 'Challenge'] as NodeType[]).map(
          (type) => {
            const isActive = activeTypeFilters[type];
            const count = nodes.filter((n) => n.type === type).length;
            const style = getNodeColor(type);

            return (
              <button
                key={type}
                onClick={() =>
                  setActiveTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }))
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-colors shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                }`}
              >
                <span>{type}</span>
                <span className={`px-1 py-0.1 rounded-xs text-[9px] ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Main Canvas + Inspector Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG Graph Viewport */}
        <div
          ref={svgContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="flex-1 h-full cursor-grab active:cursor-grabbing overflow-hidden select-none relative bg-slate-50/60"
        >
          {/* Subtle Grid Pattern Background */}
          <svg className="w-full h-full">
            <defs>
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />
                <circle cx="40" cy="40" r="1" fill="#cbd5e1" />
              </pattern>

              {/* Directional Arrowheads for each relationship type */}
              <marker id="arrow-claims" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#6366f1" />
              </marker>
              <marker id="arrow-supports" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
              </marker>
              <marker id="arrow-conflicts_with" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#f43f5e" />
              </marker>
              <marker id="arrow-verified_by" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#a855f7" />
              </marker>
            </defs>

            {/* Grid Fill */}
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Transform Container (Pan & Zoom) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Layer 1: Edges */}
              {visibleEdges.map((edge) => {
                const source = nodes.find((n) => n.id === edge.sourceId);
                const target = nodes.find((n) => n.id === edge.targetId);
                if (!source || !target) return null;

                const nodeWidth = 240;
                const nodeHeight = 76;

                // Determine port coordinates
                // Draw curve from source right to target left (or reversed if leftward)
                let x1 = source.x + nodeWidth;
                let y1 = source.y + nodeHeight / 2;
                let x2 = target.x;
                let y2 = target.y + nodeHeight / 2;

                if (source.x > target.x) {
                  x1 = source.x;
                  x2 = target.x + nodeWidth;
                }

                // Cubic Bezier curve
                const dx = Math.abs(x2 - x1) * 0.5;
                const pathD = `M ${x1} ${y1} C ${x1 + (x2 > x1 ? dx : -dx)} ${y1}, ${x2 - (x2 > x1 ? dx : -dx)} ${y2}, ${x2} ${y2}`;

                const isEdgeActive = connectedEdgeIds.has(edge.id);
                const isConflict = edge.relationship === 'conflicts_with';
                const style = getRelationStyle(edge.relationship);

                // Midpoint for relationship label chip
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g
                    key={edge.id}
                    className={`transition-opacity duration-150 ${
                      activeFocusId && !isEdgeActive ? 'opacity-15' : 'opacity-100'
                    }`}
                  >
                    {/* Shadow halo for active edges */}
                    {isEdgeActive && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={style.color}
                        strokeWidth="7"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Main Edge Path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={style.color}
                      strokeWidth={isEdgeActive ? 2.5 : isConflict ? 2.2 : 1.8}
                      strokeDasharray={style.strokeDash}
                      markerEnd={`url(#arrow-${edge.relationship})`}
                    />

                    {/* Midpoint Label Badge */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="20"
                        rx="10"
                        fill="#ffffff"
                        stroke={style.color}
                        strokeWidth="1.2"
                        className="shadow-2xs"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={style.color}
                      >
                        {style.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Layer 2: Nodes */}
              {visibleNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isConflict = node.status === 'Conflicting' || node.status === 'CONFLICTING';

                const isDimmed = activeFocusId ? !isConnected : false;
                const nodeColors = getNodeColor(node.type);

                const nodeWidth = 240;
                const nodeHeight = 76;

                return (
                  <g
                    key={node.id}
                    id={`node-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingNodeId(node.id);
                    }}
                    className={`graph-node-element cursor-pointer transition-opacity duration-150 ${
                      isDimmed ? 'opacity-20' : 'opacity-100'
                    }`}
                  >
                    {/* Active Halo Glow */}
                    {(isSelected || isHovered) && (
                      <rect
                        x="-5"
                        y="-5"
                        width={nodeWidth + 10}
                        height={nodeHeight + 10}
                        rx="16"
                        fill="none"
                        stroke={isConflict ? '#f43f5e' : nodeColors.stroke}
                        strokeWidth="3.5"
                        strokeOpacity="0.5"
                      />
                    )}

                    {/* Main Node Card */}
                    <rect
                      x="0"
                      y="0"
                      width={nodeWidth}
                      height={nodeHeight}
                      rx="12"
                      fill="#ffffff"
                      stroke={
                        isSelected
                          ? '#0f172a'
                          : isConflict
                          ? '#f43f5e'
                          : isHovered
                          ? nodeColors.stroke
                          : '#cbd5e1'
                      }
                      strokeWidth={isSelected ? 2.5 : isConflict ? 2 : 1.2}
                      className="shadow-2xs"
                    />

                    {/* Left Color Accent Bar */}
                    <rect
                      x="0"
                      y="0"
                      width="6"
                      height={nodeHeight}
                      rx="3"
                      fill={isConflict ? '#f43f5e' : nodeColors.stroke}
                    />

                    {/* Node Header Row: Type Icon/Badge + Status */}
                    <g transform="translate(14, 18)">
                      {/* Type Badge */}
                      <rect
                        x="0"
                        y="-10"
                        width="76"
                        height="16"
                        rx="4"
                        fill={node.type === 'Candidate' ? '#0f172a' : '#f1f5f9'}
                      />
                      <text
                        x="38"
                        y="1.5"
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={node.type === 'Candidate' ? '#ffffff' : '#475569'}
                      >
                        {node.type.toUpperCase()}
                      </text>

                      {/* Status Indicator */}
                      <circle
                        cx="210"
                        cy="-2"
                        r="4.5"
                        fill={
                          isConflict
                            ? '#f43f5e'
                            : node.status === 'SUPPORTED' || node.status === 'Supported'
                            ? '#10b981'
                            : '#f59e0b'
                        }
                      />
                    </g>

                    {/* Node Title */}
                    <text
                      x="14"
                      y="40"
                      fontSize="12.5"
                      fontWeight="bold"
                      fill="#0f172a"
                      className="font-sans"
                    >
                      {node.label.length > 24 ? `${node.label.slice(0, 23)}…` : node.label}
                    </text>

                    {/* Subtitle / Category */}
                    <text
                      x="14"
                      y="58"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#64748b"
                    >
                      {node.subLabel && node.subLabel.length > 28
                        ? `${node.subLabel.slice(0, 27)}…`
                        : node.subLabel || node.status}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Zoom & Canvas Controls */}
          <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-md z-10">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.35, z - 0.15))}
              className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 py-0.5 text-slate-500 font-bold border-x border-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={fitToView}
              className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              title="Fit to View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Legend */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs z-10 text-[11px] hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
              Relationship Key:
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-indigo-500" />
                <span className="font-mono text-slate-700">claims</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500" />
                <span className="font-mono text-slate-700">supports</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed border-rose-500" />
                <span className="font-mono text-rose-600 font-bold">conflicts_with</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-purple-500" />
                <span className="font-mono text-slate-700">verified_by</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Node Inspector Drawer */}
        <div className="w-80 sm:w-96 bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col justify-between shrink-0 shadow-xs z-20">
          {selectedNode ? (
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {selectedNode.type} Node
                  </span>
                  <StatusBadge status={selectedNode.status} size="sm" />
                </div>

                <h2 className="text-lg font-black text-slate-950 leading-tight">
                  {selectedNode.label}
                </h2>
                {selectedNode.subLabel && (
                  <p className="text-xs text-slate-500 font-mono">{selectedNode.subLabel}</p>
                )}
              </div>

              {/* Node Metadata Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                {selectedNode.source && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Provenance:</span>
                    <span className="font-mono text-slate-800 text-right truncate max-w-[180px]">
                      {selectedNode.source}
                    </span>
                  </div>
                )}
                {selectedNode.confidence !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedNode.confidence}%
                    </span>
                  </div>
                )}
                {selectedNode.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Category:</span>
                    <span className="font-mono text-slate-800">{selectedNode.category}</span>
                  </div>
                )}
              </div>

              {/* Node Description / Details */}
              {selectedNode.details && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Audit Specification
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedNode.details}
                  </p>
                </div>
              )}

              {/* Incoming Connections */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">
                  <span>Incoming Connections ({selectedIncoming.length})</span>
                </div>

                {selectedIncoming.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No incoming links</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedIncoming.map(({ edge, connectedNode }) => {
                      if (!connectedNode) return null;
                      const style = getRelationStyle(edge.relationship);

                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNodeId(connectedNode.id)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs ${style.bg}`}>
                              {edge.relationship}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {connectedNode.label}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Outgoing Connections */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">
                  <span>Outgoing Connections ({selectedOutgoing.length})</span>
                </div>

                {selectedOutgoing.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No outgoing links</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedOutgoing.map(({ edge, connectedNode }) => {
                      if (!connectedNode) return null;
                      const style = getRelationStyle(edge.relationship);

                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNodeId(connectedNode.id)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs ${style.bg}`}>
                              {edge.relationship}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {connectedNode.label}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contextual Action Button */}
              <div className="pt-2 border-t border-slate-100">
                {selectedNode.type === 'Evidence' && (
                  <button
                    onClick={() => setPreviewEvidence(selectedNode.rawEntity)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Raw File / Artifact</span>
                  </button>
                )}

                {selectedNode.type === 'Challenge' && (
                  <button
                    onClick={() => navigateTo('challenges')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open in Coding Sandbox</span>
                  </button>
                )}

                {selectedNode.type === 'Candidate' && (
                  <button
                    onClick={() => navigateTo('candidate-profile')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Open Full Candidate Profile</span>
                  </button>
                )}

                {selectedNode.type === 'Claim' && (
                  <button
                    onClick={() => navigateTo('claim-vs-proof')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>View in Claim vs Proof Matrix</span>
                  </button>
                )}

                {selectedNode.type === 'Assessment' && (
                  <button
                    onClick={() => navigateTo('assessments')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>View Rubric Benchmarks</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              Click any node in the canvas to inspect its proof provenance, metadata, and connections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
