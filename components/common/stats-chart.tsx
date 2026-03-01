"use client";

import { useEffect, useState } from 'react';
import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { showToast } from "@/lib/utils/notifications";
import { it } from "date-fns/locale";

const lineBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
            position: 'top',
            labels: {
                color: '#000000',
                font: { size: 10 }
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    scales: {
        y: {
            ticks: { color: '#000000', font: { size: 13 } },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            min: 0,
            beginAtZero: true,
        },
        x: {
            ticks: { color: '#000000', font: { size: 13 } },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
    }
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#000000',
                font: { size: 13 },
                boxWidth: 10,
                padding: 5
            }
        }
    }
};

interface DateRange {
    start: Date;
    end: Date;
}

const renderPeriodSelector = (chartType: string, period: string, dateRange: DateRange, handlePeriodChange: (v: string) => void, handleDateChange: (type: 'start' | 'end', value: Date | null) => void) => {
    return (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl size="small" sx={{ width: '160px' }}>
                <InputLabel id={`${chartType}-period-label`} sx={{ color: 'rgba(0, 0, 0, 0.7)', '&.Mui-focused': { color: 'rgba(0, 0, 0, 0.7)' } }}>Periodo</InputLabel>
                <Select
                    labelId={`${chartType}-period-label`}
                    value={period}
                    label="Periodo"
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    sx={{
                        color: 'black',
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.3)',
                            color: 'black',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'black',
                        },
                        '.MuiSvgIcon-root': {
                            color: 'black',
                        }
                    }}
                >
                    <MenuItem value="today">Oggi</MenuItem>
                    <MenuItem value="weekly">Ultimi 7 giorni</MenuItem>
                    <MenuItem value="monthly">Mensile</MenuItem>
                    <MenuItem value="trimester">Trimestrale</MenuItem>
                    <MenuItem value="custom">Personalizzato</MenuItem>
                </Select>
            </FormControl>
            {period === 'custom' && (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                        <DatePicker
                            label="Da"
                            value={dateRange.start}
                            onChange={(value) => handleDateChange('start', value)}
                            slotProps={{
                                textField: {
                                    size: "small",
                                }
                            }}
                            sx={{
                                width: '120px',
                                '& .MuiInputBase-root': {
                                    color: 'black',
                                    borderColor: 'rgba(0, 0, 0, 0.3)',
                                    '& fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(0, 0, 0, 0.7)',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'black',
                                }
                            }}
                        />
                        <DatePicker
                            label="A"
                            value={dateRange.end}
                            onChange={(value) => handleDateChange('end', value)}
                            slotProps={{
                                textField: {
                                    size: "small",
                                }
                            }}
                            sx={{
                                width: '120px',
                                '& .MuiInputBase-root': {
                                    color: 'black',
                                    borderColor: 'rgba(0, 0, 0, 0.3)',
                                    '& fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(0, 0, 0, 0.7)',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'black',
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Box>
            )}
        </Box>
    );
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
    chartType: 'line' | 'bar' | 'doughnut';
    fetchData: (label: string, period: string, dateRange: DateRange) => Promise<DatasetItem[]>;
}

const StatsChart = ({ label, chartType, fetchData }: StatsChartProps) => {
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({ start: new Date(new Date().setDate(new Date().getDate() - 90)), end: new Date() });
    const [datasets, setDatasets] = useState<DatasetItem[]>([]);
    const [labels, setLabels] = useState<string[]>([]);

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
    };

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
        fetchData(label, period, dateRange).then((data) => {
            console.log(data);
            setDatasets(data);
            setLoading(false);
        });
    }, [period, dateRange]);

    const ChartComponent = {
        line: Line,
        bar: Bar,
        doughnut: Doughnut
    }[chartType];

    const chartData = {
        labels: datasets[0]?.labels,
        datasets: datasets.map(dataset => ({
            ...dataset,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            fill: true
        }))
    };

    return (
        <Box sx={{ minHeight: '300px' }}>
            {renderPeriodSelector(label, period, dateRange, handlePeriodChange, handleDateChange)}
            {loading && (
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress color="inherit" />
                </Box>
            )}
            <Box hidden={loading} sx={{ height: '220px' }}>
                {/* @ts-expect-error chart.js generic typing */}
                <ChartComponent data={chartData} options={chartType === 'doughnut' ? doughnutOptions : {...lineBarOptions, scales: {...lineBarOptions.scales, x: {...lineBarOptions.scales.x, display: period === 'custom' ? false : true}}}} />
            </Box>
        </Box>
    );
};

export default StatsChart;
