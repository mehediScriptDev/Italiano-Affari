"use client";

import { Box, Button, Card, CardContent, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { showToast } from "@/lib/utils/notifications";
import { createAsset, createAssetWithEmail, deleteAsset, fetchAllAssets } from "@/lib/api/partners";
import AssetDialog from "./asset-dialog";

interface Asset {
  id: number;
  iban: string;
  vatNumber?: string;
  percentage: number;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  entityType: string;
  fiscalCode?: string;
}

export default function PaymentAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [freePercentage, setFreePercentage] = useState(100);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchAllAssets();
      const mapped: Asset[] = res.data.map((a: Record<string, unknown>) => ({
        id: a.id, iban: a.iban, vatNumber: a.vat_number, percentage: a.percentage,
        companyName: a.company_name, firstName: a.first_name, lastName: a.last_name,
        entityType: a.entity_type, fiscalCode: a.fiscal_code,
      }));
      setAssets(mapped);
      setFreePercentage(100 - mapped.reduce((acc, c) => acc + Number(c.percentage), 0));
    })();
  }, []);

  const handleOpenDialog = () => {
    if (freePercentage > 0) setOpenDialog(true);
    else showToast("Non c'è piu percentuale disponibile!", "error");
  };

  const handleDeleteAsset = (index: number) => {
    const asset = assets[index];
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
    setFreePercentage(100 - newAssets.reduce((acc, c) => acc + Number(c.percentage), 0));
    deleteAsset(asset.id);
  };

  const handleSubmit = (formData: Record<string, unknown>) => {
    setFreePercentage((p) => p - Number(formData.percentage));
    if (formData.entityType === "individual") {
      createAssetWithEmail(formData.email as string, formData.percentage as number);
    } else {
      setAssets((p) => [...p, formData as unknown as Asset]);
      createAsset({
        entity_type: formData.entityType as string, iban: formData.iban as string,
        vat_number: formData.vatNumber as string, address: formData.fullAddress as string,
        fiscal_code: formData.fiscalCode as string, percentage: formData.percentage as number,
        company_name: formData.companyName as string, first_name: formData.firstName as string,
        last_name: formData.lastName as string,
      });
    }
  };

  const renderAsset = (asset: Asset, index: number) => (
    <div className="mt-1" key={`card-${index}`}>
      <Card style={{ background: "linear-gradient(to right, #2e2e2e 30%, #040404)", minWidth: "320px" }} className="text-white" elevation={10} sx={{ borderRadius: 2 }}>
        <CardContent style={{ padding: "10px 15px" }} className="position-relative">
          <p style={{ fontSize: "12px" }} className="mb-0">IBAN</p>
          <p style={{ fontSize: "17px" }} className="mt-0">{asset.iban}</p>
          {asset.vatNumber ? (
            <><p style={{ fontSize: "12px" }} className="mb-0 mt-1">Partita IVA</p><p style={{ fontSize: "15px" }} className="mt-0">{asset.vatNumber}</p></>
          ) : (
            <><p style={{ fontSize: "12px" }} className="mb-0 mt-1">Codice Fiscale</p><p style={{ fontSize: "14px" }} className="mt-0">{asset.fiscalCode}</p></>
          )}
          <p style={{ fontSize: "12px" }} className="mb-0 mt-1">Percentuale</p>
          <p className="mt-0">{asset.percentage}%</p>
          <p className="mt-1">{asset.entityType === "company" ? asset.companyName : `${asset.firstName} ${asset.lastName}`}</p>
          <div className="d-flex justify-end position-absolute top-0 inset-e-0">
            <IconButton style={{ padding: "5px" }} color="error" onClick={() => handleDeleteAsset(index)}><Delete /></IconButton>
            <IconButton style={{ padding: "5px" }} sx={{ color: "white" }} onClick={() => {}}><Edit /></IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="card-shadow" sx={{ borderRadius: 2, minHeight: "650px", position: "relative" }}>
      <CardContent>
        <h3 className="text-center">Gestisci Pagamenti</h3>
        <Typography align="center" variant="body1">In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset</Typography>
        <hr style={{ width: "100%" }} />
        <h4 className="text-center mb-0">Asset di pagamento</h4>
        <Box sx={{ mt: 2 }}>
          <div className="d-flex justify-end me-3">
            <Button variant="contained" color="secondary" onClick={handleOpenDialog}>Aggiungi</Button>
            <AssetDialog open={openDialog} onAdd={handleSubmit} onClose={() => setOpenDialog(false)} freePercentage={freePercentage} />
          </div>
          {assets.length === 0 && (
            <Box sx={{ position: "absolute", width: "97%", textAlign: "center", top: "50%" }}>
              <Typography variant="body1">Non hai registrato ancora nessun asset di pagamento</Typography>
            </Box>
          )}
          <div className="d-flex gap-2">{assets.map(renderAsset)}</div>
        </Box>
      </CardContent>
    </Card>
  );
}
