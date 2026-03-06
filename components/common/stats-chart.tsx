"use client";

import { useEffect, useMemo, useState } from 'react';
import { Box, MenuItem, Select, Skeleton } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { showToast } from "@/lib/utils/notifications";
import { it } from "date-fns/locale";
import type { Chart as ChartJS } from 'chart.js';

/** Per-label color palette ------------------------------------------------ */
const labelColors: Record<string, { primary: string }> = {
    commissioni: { primary: '#6366f1' },
    vendite:     { primary: '#10b981' },
    affiliati:   { primary: '#f59e0b' },
};

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

/** Injects a canvas gradient into each line dataset's backgroundColor before draw */
function makeGradientPlugin(primary: string) {
    return {
        id: `gradientFill_${primary}`,
        beforeDatasetsDraw(chart: ChartJS) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            chart.data.datasets.forEach((ds) => {
                const d = ds as unknown as Record<string, unknown>;
                if (d.fill) {
                    const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    grad.addColorStop(0,    hexToRgba(primary, 0.28));
                    grad.addColorStop(0.55, hexToRgba(primary, 0.07));
                    grad.addColorStop(1,    hexToRgba(primary, 0.00));
                    d.backgroundColor = grad;
                }
            });
        },
    };
}

const getOptions = (showX = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 500, easing: 'easeInOutCubic' as const },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#ffffff',
            bodyColor: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            padding: 14,
            cornerRadius: 12,
            displayColors: false,
            titleFont: { size: 12, weight: 'bold' as const },
            bodyFont: { size: 13 },
        },
    },
    scales: {
        y: {
            ticks: { color: '#94a3b8', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.04)' },
            border: { display: false },
            beginAtZero: true,
        },
        x: {
            display: showX,
            ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 0, maxTicksLimit: 8 },
            grid: { display: false },
            border: { display: false },
        },
    },
});

interface DateRange {
    start: Date;
    end: Date;
}

const datepickerSx = {
    width: '130px',
    '& .MuiInputBase-root': {
        borderRadius: '8px',
        backgroundColor: '#f6f8fb',
        '& fieldset': { borderColor: 'transparent' },
        '&:hover fieldset': { borderColor: '#c4c8d0' },
        '&.Mui-focused fieldset': { borderColor: '#13131f' },
    },
};

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
    chartType: 'line' | 'bar';
    fetchData: (label: string, period: string, dateRange: DateRange) => Promise<DatasetItem[]>;
}

const selectSx = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#13131f',
    borderRadius: '8px',
    backgroundColor: '#f6f8fb',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c4c8d0' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#13131f' },
    '.MuiSvgIcon-root': { color: '#64748b' },
};

const StatsChart = ({ label, chartType, fetchData }: StatsChartProps) => {
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({ start: new Date(new Date().setDate(new Date().getDate() - 90)), end: new Date() });
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);

    const colors = labelColors[label] ?? { primary: '#6366f1' };
    const gradientPlugin = useMemo(() => makeGradientPlugin(colors.primary), [colors.primary]);

    const handleDateChange = (dateType: 'start' | 'end', value: Date | null) => {
        if (!value) return;
        const newDateRange = {
            ...dateRange,
            [dateType]: value
        };

        const diffInDays = Math.abs((newDateRange.end.getTime() - newDateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays > 90) {
            showToast("Puoi analizzare un report di massimo 90 giorni", "error");
            return;
        }

        setDateRange(newDateRange);
    };

    useEffect(() => {
        setLoading(true);
        fetchData(label, period, dateRange)
            .then((data) => {
                setDatasets(data);
            })
            .catch(() => {
                setDatasets([]);
            })
            .finally(() => {
                setLoading(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, dateRange]);

    const chartData = {
        labels: datasets[0]?.labels ?? [],
        datasets: datasets.map(ds => (
            chartType === 'line'
                ? {
                    ...ds,
                    borderColor:            colors.primary,
                    backgroundColor:        hexToRgba(colors.primary, 0.15), // overwritten by gradient plugin
                    fill:                   true,
                    borderWidth:            2.5,
                    pointRadius:            0,
                    pointHoverRadius:       5,
                    pointHoverBackgroundColor: colors.primary,
                    pointHoverBorderColor:  '#ffffff',
                    pointHoverBorderWidth:  2,
                    tension:                0.42,
                }
                : {
                    ...ds,
                    backgroundColor:        hexToRgba(colors.primary, 0.85),
                    hoverBackgroundColor:   colors.primary,
                    borderRadius:           7,
                    borderSkipped:          false,
                    borderWidth:            0,
                    barPercentage:          0.62,
                    categoryPercentage:     0.80,
                }
        ))
    };

    return (
        <Box>
            {/* Period selector */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Select
                    size="small"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    sx={{ ...selectSx, minWidth: 155 }}
                    displayEmpty
                >
                    <MenuItem value="today">Oggi</MenuItem>
                    <MenuItem value="weekly">Ultimi 7 giorni</MenuItem>
                    <MenuItem value="monthly">Questo mese</MenuItem>
                    <MenuItem value="trimester">Trimestrale</MenuItem>
                    <MenuItem value="custom">Personalizzato</MenuItem>
                </Select>
                {period === 'custom' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                        <DatePicker
                            label="Da"
                            value={dateRange.start}
                            onChange={(v) => handleDateChange('start', v)}
                            slotProps={{ textField: { size: 'small', sx: datepickerSx } }}
                        />
                        <DatePicker
                            label="A"
                            value={dateRange.end}
                            onChange={(v) => handleDateChange('end', v)}
                            slotProps={{ textField: { size: 'small', sx: datepickerSx } }}
                        />
                    </LocalizationProvider>
                )}
            </Box>

            {/* Chart area */}
            <Box sx={{ height: '260px', position: 'relative' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
                        <Skeleton variant="rectangular" height={215} sx={{ borderRadius: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {[20, 14, 18, 13, 16, 12].map((w, i) => (
                                <Skeleton key={i} variant="rectangular" width={`${w}%`} height={9} sx={{ borderRadius: 1 }} />
                            ))}
                        </Box>
                    </Box>
                ) : (
                    chartType === 'line' ? (
                        <Line data={chartData} options={getOptions(period !== 'custom')} plugins={[gradientPlugin]} />
                    ) : (
                        <Bar data={chartData} options={getOptions(period !== 'custom')} />
                    )
                )}
            </Box>
        </Box>
    );
};

export default StatsChart;
