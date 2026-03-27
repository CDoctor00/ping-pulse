import type { Host, HostStatus } from "@/types";
import HostNode from "./HostNode";
import dagre from "dagre";
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MarkerType,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { Maximize2, Minimize2 } from "lucide-react";
import "reactflow/dist/style.css";

interface NetworkGraphProps {
  hosts: Host[];
  onNodeClick?: (host: Host) => void;
  statusFilter?: HostStatus | undefined;
  searchQuery?: string;
}

const nodeTypes = {
  hostNode: HostNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

function getLatoutedElements(nodes: Node[], edges: Edge[], direction = "TB") {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
  });

  //? Adding node on graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  //? Addding edges on graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  //? Calculate layout
  dagre.layout(dagreGraph);

  //? Applicate positions
  const layoutNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutNodes, edges };
}

export function NetworkGraph({
  hosts,
  onNodeClick,
  statusFilter,
  searchQuery = "",
}: NetworkGraphProps) {
  const [layoutDirection, setLayoutDirection] = useState<"TB" | "LR">("TB");

  const { fitView } = useReactFlow();

  const initialNodes: Node[] = useMemo(() => {
    return hosts.map((host) => {
      const machesStatus =
        statusFilter === undefined || host.status === statusFilter;

      const machesSearch =
        !searchQuery.trim() ||
        host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const isFiltered = machesStatus && machesSearch;

      return {
        id: host.ipAddress,
        type: "hostNode",
        position: { x: 0, y: 0 },
        data: {
          host,
          onClick: onNodeClick,
          isFiltered,
        },
      };
    });
  }, [hosts, onNodeClick, statusFilter, searchQuery]);

  const initialEdges: Edge[] = useMemo(() => {
    return hosts
      .filter((host): host is Host & { parentIP: string } => !!host.parentIP) //? Type Guard
      .map((host) => {
        //? Nodes
        const parent = hosts.find((h) => h.ipAddress === host.parentIP);
        const isHostDown = host.status === "DOWN";
        const isParentDown = parent?.status === "DOWN";

        //? Filter
        const isHostFiltered =
          statusFilter === undefined || host.status === statusFilter;
        const isParentFiltered =
          statusFilter === undefined || parent?.status === statusFilter;
        const isEdgeFiltered = isHostFiltered || isParentFiltered;

        return {
          id: `${host.parentIP} - ${host.ipAddress}`,
          source: host.parentIP,
          target: host.ipAddress,
          type: ConnectionLineType.SmoothStep,
          animated:
            host.status === "UP" && parent?.status === "UP" && isEdgeFiltered,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color:
              isHostDown || isParentDown
                ? "hsl(var(--error))"
                : host.status === "PENDING"
                  ? "hsl(var(--pending))"
                  : host.status === "UNREACHABLE"
                    ? "hsl(var(--warning))"
                    : "hsl(var(--info))",
            strokeWidth: 2,
            opacity: isEdgeFiltered ? 1 : 0.2,
          },
          style: {
            stroke:
              isHostDown || isParentDown
                ? "hsl(var(--error))"
                : host.status === "PENDING"
                  ? "hsl(var(--pending))"
                  : host.status === "UNREACHABLE"
                    ? "hsl(var(--warning))"
                    : "hsl(var(--info))",
            strokeWidth: 2,
          },
          label: undefined,
          labelStyle: {
            fill: "hsl(var(--foreground))",
            fontSize: 10,
            fontWeight: 500,
            opacity: isEdgeFiltered ? 1 : 0.3,
          },
          labelBgStyle: {
            fill: "hsl(var(--card))",
            fillOpacity: 0.8,
          },
        };
      });
  }, [hosts, statusFilter]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLatoutedElements(initialNodes, initialEdges, "TB");
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  //? Update layout
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLatoutedElements(
      initialNodes,
      initialEdges,
      layoutDirection,
    );

    setNodes(newNodes);
    setEdges(newEdges);

    setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50);
  }, [
    initialNodes,
    initialEdges,
    layoutDirection,
    setNodes,
    setEdges,
    fitView,
  ]);

  return (
    <div className="h-[calc(100vh-400px)] rounded-lg border border-border bg-card overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: ConnectionLineType.SmoothStep,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
        <Controls />

        {/* <MiniMap
          nodeColor={(node) => {
            const host = node.data.host as Host;

            return host.status === "UP"
              ? "hsl(var(--success))"
              : host.status === "DOWN"
                ? "hsl(var(--error))"
                : host.status === "PENDING"
                  ? "hsl(var(--pending))"
                  : host.status === "UNREACHABLE"
                    ? "hsl(var(--warning))"
                    : "hsl(var(--info))";
          }}
          maskColor="hsl(var(--card) / 0.8)"
          className="bg-card! border-border! shadow-lg! cursor-grab!"
        /> */}

        {/* Custom Controls Panel */}
        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setLayoutDirection((prev) => (prev === "TB" ? "LR" : "TB"))
            }
          >
            {layoutDirection === "TB" ? (
              <>
                <Minimize2 className="mr-2 h-4 w-4" />
                Orizzontale
              </>
            ) : (
              <>
                <Maximize2 className="mr-2 h-4 w-4" />
                Verticale
              </>
            )}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

import { ReactFlowProvider } from "reactflow";

export default function NetworkGraphWithProvider(props: NetworkGraphProps) {
  return (
    <ReactFlowProvider>
      <NetworkGraph {...props} />
    </ReactFlowProvider>
  );
}
