"use client";

import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { showToast } from "@/lib/utils/notifications";
import { it } from "date-fns/locale";
import type { ChartData, ChartOptions } from "chart.js";

const lineBarOptions: ChartOptions<"line" | "bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false, position: "top" },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    y: {
      ticks: { color: "#000000", font: { size: 13 } },
      grid: { color: "rgba(0, 0, 0, 0.1)" },
      min: 0,
      beginAtZero: true,
    },
    x: {
      ticks: { color: "#000000", font: { size: 13 } },
      grid: { color: "rgba(0, 0, 0, 0.1)" },
    },
  },
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#000000", font: { size: 13 }, boxWidth: 10, padding: 5 },
    },
  },
};

interface DateRange {
  start: Date;
  end: Date;
}

interface PeriodSelectorProps {
  chartType: string;
  period: string;
  dateRange: DateRange;
  onPeriodChange: (v: string) => void;
  onDateChange: (type: "start" | "end", value: Date | null) => void;
}

function PeriodSelector({
  chartType,
  period,
  dateRange,
  onPeriodChange,
  onDateChange,
}: PeriodSelectorProps) {
  return (
    <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
      <FormControl size="small" sx={{ width: "160px" }}>
        <InputLabel id={`${chartType}-period-label`} sx={{ color: "rgba(0,0,0,0.5)", fontSize: "13px", "&.Mui-focused": { color: "rgba(0,0,0,0.7)" } }}>Periodo</InputLabel>
        <Select
          labelId={`${chartType}-period-label`}
          value={period}
          label="Periodo"
          onChange={(e) => onPeriodChange(e.target.value)}
          sx={{
            color: "black",
            borderRadius: "8px",
            fontSize: "13px",
            backgroundColor: "#f6f8fb",
            ".MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.15)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
            ".MuiSvgIcon-root": { color: "#64748b" },
          }}
        >
          <MenuItem value="today">Oggi</MenuItem>
          <MenuItem value="weekly">Ultimi 7 giorni</MenuItem>
          <MenuItem value="monthly">Mensile</MenuItem>
          <MenuItem value="trimester">Trimestrale</MenuItem>
          <MenuItem value="custom">Personalizzato</MenuItem>
        </Select>
      </FormControl>
      {period === "custom" && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <DatePicker
              label="Da"
              value={dateRange.start}
              onChange={(value) => onDateChange("start", value)}
              slotProps={{ textField: { size: "small" } }}
              sx={{
                width: "120px",
                "& .MuiInputBase-root": { color: "black", borderRadius: "8px", fontSize: "13px", backgroundColor: "#f6f8fb", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "rgba(0,0,0,0.15)" } },
                "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.5)", fontSize: "13px" },
                "& .MuiSvgIcon-root": { color: "#64748b" },
              }}
            />
            <DatePicker
              label="A"
              value={dateRange.end}
              onChange={(value) => onDateChange("end", value)}
              slotProps={{ textField: { size: "small" } }}
              sx={{
                width: "120px",
                "& .MuiInputBase-root": { color: "black", borderRadius: "8px", fontSize: "13px", backgroundColor: "#f6f8fb", "& fieldset": { borderColor: "transparent" }, "&:hover fieldset": { borderColor: "rgba(0,0,0,0.15)" } },
                "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.5)", fontSize: "13px" },
                "& .MuiSvgIcon-root": { color: "#64748b" },
              }}
            />
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
}

interface DatasetItem {
  labels: string[];
  label: string;
  data: number[];
  borderColor?: string | string[];
  backgroundColor?: string | string[];
  fill?: boolean;
  [key: string]: unknown;
}

interface StatsChartProps {
  label: string;
  chartType: "line" | "bar" | "doughnut";
  fetchData: (label: string, period: string, dateRange: DateRange) => Promise<DatasetItem[]>;
}

export default function StatsChart({ label, chartType, fetchData }: StatsChartProps) {
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 90)),
    end: new Date(),
  });
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);

  const handleDateChange = (dateType: "start" | "end", value: Date | null) => {
    if (!value) return;
    const newRange = { ...dateRange, [dateType]: value };
    const diffDays = Math.abs(
      (newRange.end.getTime() - newRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 90) {
      showToast("Puoi analizzare un report di massimo 90 giorni", "error");
      return;
    }
    setDateRange(newRange);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(label, period, dateRange).then((data) => {
      setDatasets(data);
      setLoading(false);
    });
  }, [period, dateRange, label, fetchData]);

  const ChartComponent = { line: Line, bar: Bar, doughnut: Doughnut }[chartType];

  const chartData: ChartData<typeof chartType> = {
    labels: datasets[0]?.labels ?? [],
    datasets: datasets.map((ds) => ({
      ...ds,
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.2)",
      fill: true,
    })),
  } as ChartData<typeof chartType>;

  const options =
    chartType === "doughnut"
      ? doughnutOptions
      : {
          ...lineBarOptions,
          scales: {
            ...lineBarOptions.scales,
            x: { ...lineBarOptions.scales?.x, display: period !== "custom" },
          },
        };

  return (
    <Box sx={{ minHeight: "300px" }}>
      <PeriodSelector
        chartType={label}
        period={period}
        dateRange={dateRange}
        onPeriodChange={setPeriod}
        onDateChange={handleDateChange}
      />
      {loading && (
        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
      <Box hidden={loading} sx={{ height: "220px" }}>
        {/* @ts-expect-error - chart.js generic typing mismatch */}
        <ChartComponent data={chartData} options={options} />
      </Box>
    </Box>
  );
}
