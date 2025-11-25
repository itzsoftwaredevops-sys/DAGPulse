import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { HashrateDataPoint } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HashrateChartProps {
  data: HashrateDataPoint[];
  title?: string;
  height?: number;
}

export function HashrateChart({ data, title = "Pool Hashrate", height = 300 }: HashrateChartProps) {
  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
    if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`;
    if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`;
    if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} KH/s`;
    return `${hashrate.toFixed(2)} H/s`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const chartData = {
    labels: data.map((point) => formatTime(point.timestamp)),
    datasets: [
      {
        label: "Hashrate",
        data: data.map((point) => point.hashrate),
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
          gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.1)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(139, 92, 246)",
        pointHoverBorderColor: "rgb(168, 85, 247)",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `${formatHashrate(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          maxTicksLimit: 8,
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          callback: (value) => {
            const numValue = typeof value === 'number' ? value : 0;
            return formatHashrate(numValue);
          },
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <Card className="p-6" data-testid="card-hashrate-chart">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-foreground">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
