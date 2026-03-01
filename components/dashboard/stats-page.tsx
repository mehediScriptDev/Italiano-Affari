"use client";

import {useEffect, useState} from 'react';
import {Box, Card, CardContent, Grid, Typography, useMediaQuery} from "@mui/material";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import StatsChart from "@/components/common/stats-chart";
import {AttachMoney, Handshake, ShoppingBag} from "@mui/icons-material";
import ChartPreview from "@/components/common/chart-preview";
import {fetchAffiliates, fetchEarnings, fetchSales} from "@/lib/api/partners";
import type { Theme } from "@mui/material/styles";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Filler,
    Tooltip,
    Legend
);

export default function StatsPage() {
    const [previewMode,setPreviewMode] = useState('today');

    const [chartsPreview,setChartsPreview] = useState({
        sales:null,
        earnings:null,
        affiliates:null
    });

    useEffect(() => {
        fetchChartData();
    },[])

    const fetchChartData = () => {

        fetchEarnings().then((res) => {
            setChartsPreview((prev) => ({...prev, earnings: res.data}));
        });

        fetchSales().then((res) => {
            setChartsPreview((prev) => ({...prev, sales: res.data}));
        });

        fetchAffiliates().then((res) => {
            setChartsPreview((prev) => ({...prev, affiliates: res.data}));
        });
    };

    const fetchBigChart = (chartType: string, periodType: string, dateRange: { start: Date; end: Date }) => {
        let startDate: Date, endDate: Date;
        switch (periodType) {
            case 'today':
                startDate = new Date();
                endDate = new Date();
                break;

            case 'weekly':
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                break;

            case 'monthly':
                endDate = new Date();
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;

            case 'trimester':
                endDate = new Date();
                startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 2, 1);
                break;
            case 'custom':
                startDate = dateRange.start;
                endDate = dateRange.end;
                break;
            default:
                startDate = new Date();
                endDate = new Date();
                break;
        }

        const chartTypeToFetchFunction: Record<string, typeof fetchEarnings> = {
            commissioni: fetchEarnings,
            vendite: fetchSales,
            affiliati: fetchAffiliates,
        };

        const fetchFunction = chartTypeToFetchFunction[chartType];

        if (!fetchFunction) {
            throw new Error(`Invalid chartType: ${chartType}`);
        }



        return fetchFunction(startDate, endDate).then((res) => {
            let labels = Object.keys(res.data.data);

            if(periodType !== "today") {
                labels = labels.map((label) => {
                    const date = new Date(label);

                    return date.toLocaleDateString('it-IT', {
                        month: '2-digit',
                        day: '2-digit'
                    });
                });
            }

            return getChartData(chartType, Object.values(res.data.data), labels);
        });
    }

    const config: Record<string, { label: string; colors: string[]; borderColors?: string[] }> = {
        vendite: {
            label: 'Vendite Dirette',
            colors: ['rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)']
        },
        commissioni: {
            label: 'Commissioni Generate',
            colors: ['rgba(255, 159, 64, 0.6)', 'rgba(255, 159, 64, 1)']
        },
        guadagni: {
            label: 'Guadagni Maturati',
            colors: ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)']
        },
        affiliati: {
            label: 'Nuovi Affiliati',
            colors: [
                'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 159, 64, 0.6)'
            ],
            borderColors: [
                'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'
            ]
        }
    };


    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    const getChartData = (chartType: string, data: number[], labels: string[]) => {

        const {label, colors, borderColors} = config[chartType];

        if (chartType === 'affiliati') {
            return [{
                labels: labels,
                label,
                data: data,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }];
        } else {
            return [{
                labels: labels,
                label,
                data: data,
                borderColor: colors[0],
                backgroundColor: colors[1],
                pointRadius: 0,
                fill: true,
                fillOpacity: 1,
                tension: 0.5,
                borderWidth: 1
            }];
        }
    };

    const generateRandomData = (min: number, max: number, count: number) => {
        return Array.from({length: count}, () =>
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    };

    const togglePreviewMode = () =>{
        setPreviewMode(previewMode === 'today' ? "year" : "today");
    }

    return (
        <Box className="w-100 paddingContainer mt-3" sx={{backgroundColor: 'transparent'}}>
            <div className="flex items-center justify-between mb-2">
                <h1 className="page-title">Statistiche</h1>
            </div>
            <div className="row d-flex justify-center">
                <Grid className={isMobile ? 'px-0' : "px-1"} container spacing={isMobile ? 2 : 1} sx={{mt:2, p:0}}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ChartPreview label={"Vendite Dirette"}
                                      icon={<ShoppingBag style={{color: "black", fontSize: "24px"}}/>}
                                      obj={chartsPreview.sales}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ChartPreview label={"Guadagni Maturati"}
                                      icon={<AttachMoney style={{color: "black", fontSize: "24px"}}/>}
                                      obj={chartsPreview.earnings}
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 4 }}>
                        <ChartPreview label={"Co-Partner"}
                                      icon={<Handshake style={{color: "black", fontSize: "24px"}}/>}
                                      obj={chartsPreview.affiliates}
                        />
                    </Grid>
                </Grid>
                <div className="col-12 mb-4">
                    <Grid container mt={2} spacing={isMobile ? 2 : 0}>
                        <Grid size={{ xs: 12, md: 12 }}>
                            <Card sx={{borderRadius: 2, boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}>
                                <CardContent>
                                    <Typography align={"center"} variant="h6"
                                                sx={{color: 'black', mb: 1, fontSize: 16}}>
                                        Totale Commissioni Generate
                                    </Typography>

                                    <StatsChart label={"commissioni"} chartType={"line"} fetchData={fetchBigChart}/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>

                <div className="col-12 mb-4">

                    <Grid container spacing={isMobile ? 2 : 0}>
                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                              sx={{borderRight: {md: '1px solid rgba(255, 255, 255, 0.12)'}, pr: {md: 2}}}>
                            <Card sx={{borderRadius: 2, boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}>
                                <CardContent>
                                    <Typography align={"center"} variant="h6"
                                                sx={{color: 'black', mb: 1, fontSize: 16}}>
                                        Totale Vendite Dirette
                                    </Typography>
                                    <StatsChart label={"vendite"} chartType={"line"} fetchData={fetchBigChart}/>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{pl: {md: 2}}}>
                            <Card sx={{borderRadius: 2, boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}>
                                <CardContent>
                                    <Typography align={"center"} variant="h6"
                                                sx={{color: 'black', mb: 1, fontSize: 16}}>
                                        Nuovi Affiliati Registrati
                                    </Typography>


                                    <StatsChart label={"affiliati"} chartType={"bar"} fetchData={fetchBigChart}/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </Box>
    );
}
