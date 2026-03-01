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
  const [editingAsset, setEditingAsset] = useState<Record<string, unknown> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    if (freePercentage > 0) {
      setEditingAsset(null);
      setEditingIndex(null);
      setOpenDialog(true);
    }
    else showToast("Non c'è piu percentuale disponibile!", "error");
  };

  const handleEditAsset = (index: number) => {
    const asset = assets[index];
    setEditingAsset({
      entityType: asset.entityType,
      companyName: asset.companyName ?? "",
      vatNumber: asset.vatNumber ?? "",
      fiscalCode: asset.fiscalCode ?? "",
      iban: asset.iban,
      email: "",
      address: "",
      city: "",
      zipCode: "",
    });
    setEditingIndex(index);
    setFreePercentage((prev) => prev + Number(asset.percentage));
    setOpenDialog(true);
  };

  const handleDeleteAsset = (index: number) => {
    const asset = assets[index];
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
    setFreePercentage(100 - newAssets.reduce((acc, c) => acc + Number(c.percentage), 0));
    deleteAsset(asset.id);
  };

  const handleSubmit = (formData: Record<string, unknown>) => {
    // If editing, delete old asset first
    if (editingIndex !== null) {
      const oldAsset = assets[editingIndex];
      deleteAsset(oldAsset.id);
      setAssets((prev) => prev.filter((_, i) => i !== editingIndex));
    }

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
    setEditingAsset(null);
    setEditingIndex(null);
  };

  const renderAsset = (asset: Asset, index: number) => (
    <div className="mt-1" key={`card-${index}`}>
      <Card className="text-white" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)", minWidth: "320px" }} elevation={0} sx={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <CardContent className="position-relative" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }} className="mb-0">IBAN</p>
          <p style={{ fontSize: "16px", letterSpacing: "0.5px" }} className="mt-0">{asset.iban}</p>
          {asset.vatNumber ? (
            <><p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }} className="mb-0 mt-1">Partita IVA</p><p style={{ fontSize: "14px" }} className="mt-0">{asset.vatNumber}</p></>
          ) : (
            <><p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }} className="mb-0 mt-1">Codice Fiscale</p><p style={{ fontSize: "14px" }} className="mt-0">{asset.fiscalCode}</p></>
          )}
          <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }} className="mb-0 mt-1">Percentuale</p>
          <p className="mt-0">{asset.percentage}%</p>
          <p className="mt-1">{asset.entityType === "company" ? asset.companyName : `${asset.firstName} ${asset.lastName}`}</p>
          <div className="d-flex justify-end position-absolute top-0 end-0">
            <IconButton style={{ padding: "5px 5px" }} color="error" onClick={() => handleDeleteAsset(index)}><Delete /></IconButton>
            <IconButton style={{ padding: "5px 5px", color: "white" }} onClick={() => handleEditAsset(index)}><Edit /></IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="card-shadow" sx={{ borderRadius: "12px", minHeight: "650px", position: "relative" }}>
      <CardContent sx={{ p: "28px !important" }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 700, textAlign: "center", letterSpacing: "-0.3px" }}>Gestisci Pagamenti</Typography>
        <Typography align="center" sx={{ fontSize: "14px", color: "#64748b", mt: 0.5 }}>In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset</Typography>
        <hr style={{ width: "100%", border: "none", borderTop: "1px solid rgba(0,0,0,0.06)", margin: "20px 0" }} />
        <Typography sx={{ fontSize: "16px", fontWeight: 700, textAlign: "center", mb: 0 }}>Asset di pagamento</Typography>
        <Box sx={{ mt: 2 }}>
          <div className="d-flex justify-end me-3">
            <Button variant="contained" color="secondary" onClick={handleOpenDialog} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Aggiungi</Button>
            <AssetDialog
              open={openDialog}
              onAdd={handleSubmit}
              onClose={() => {
                setOpenDialog(false);
                if (editingIndex !== null) {
                  // Restore the percentage if dialog is canceled during edit
                  const asset = assets[editingIndex];
                  if (asset) setFreePercentage((prev) => prev - Number(asset.percentage));
                  setEditingAsset(null);
                  setEditingIndex(null);
                }
              }}
              freePercentage={freePercentage}
              initialData={editingAsset}
              isEditing={editingIndex !== null}
            />
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
