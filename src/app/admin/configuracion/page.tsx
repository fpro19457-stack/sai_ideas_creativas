"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Save, CreditCard, MapPin, Truck, MessageCircle} from "lucide-react";

interface Configuracion {
  metodosPago: {
    mercadopago: boolean;
    efectivo: boolean;
  };
  entrega: {
    retiroLocal: {
      activo: boolean;
      direccion: string;
      horarios: string;
    };
    envio: {
      activo: boolean;
      costos: {
        CABA: {min: number; max: number; costo: number};
        GBA: {min: number; max: number; costo: number};
        INTERIOR: {min: number; max: number; costo: number};
      };
    };
  };
  whatsapp: string;
}

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchConfig = async () => {
      try {
        const resPerfil = await fetch("/api/admin/perfil");
        if (cancelled) return;
        if (!resPerfil.ok) {
          window.location.href = "/admin/login";
          return;
        }

        const res = await fetch("/api/configuracion");
        const data = await res.json();
        if (!cancelled) setConfig(data);
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch("/api/configuracion", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-playfair">Configuración</h1>
        <p className="text-muted-foreground">Personalizá cómo funciona tu tienda</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Métodos de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mercadopago">MercadoPago</Label>
              <Switch
                id="mercadopago"
                checked={config.metodosPago.mercadopago}
                onCheckedChange={(checked) =>
                  setConfig({...config, metodosPago: {...config.metodosPago, mercadopago: checked}})
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="efectivo">Efectivo</Label>
              <Switch
                id="efectivo"
                checked={config.metodosPago.efectivo}
                onCheckedChange={(checked) =>
                  setConfig({...config, metodosPago: {...config.metodosPago, efectivo: checked}})
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              * Efectivo solo disponible para retiro en local
            </p>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Retiro en local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Habilitar retiro en local</Label>
              <Switch
                checked={config.entrega.retiroLocal.activo}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    entrega: {...config.entrega, retiroLocal: {...config.entrega.retiroLocal, activo: checked}},
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={config.entrega.retiroLocal.direccion}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    entrega: {...config.entrega, retiroLocal: {...config.entrega.retiroLocal, direccion: e.target.value}},
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Horarios de atención</Label>
              <Input
                value={config.entrega.retiroLocal.horarios}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    entrega: {...config.entrega, retiroLocal: {...config.entrega.retiroLocal, horarios: e.target.value}},
                  })
                }
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Costos de envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Habilitar envío a domicilio</Label>
              <Switch
                checked={config.entrega.envio.activo}
                onCheckedChange={(checked) =>
                  setConfig({...config, entrega: {...config.entrega, envio: {...config.entrega.envio, activo: checked}}})
                }
              />
            </div>

            {config.entrega.envio.activo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Zona</Label>
                    <Input value="CABA" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>CP desde</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.CABA.min}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                CABA: {...config.entrega.envio.costos.CABA, min: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CP hasta</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.CABA.max}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                CABA: {...config.entrega.envio.costos.CABA, max: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costo ($)</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.CABA.costo}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                CABA: {...config.entrega.envio.costos.CABA, costo: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Zona</Label>
                    <Input value="GBA" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>CP desde</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.GBA.min}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                GBA: {...config.entrega.envio.costos.GBA, min: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CP hasta</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.GBA.max}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                GBA: {...config.entrega.envio.costos.GBA, max: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costo ($)</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.GBA.costo}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                GBA: {...config.entrega.envio.costos.GBA, costo: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Zona</Label>
                    <Input value="Interior" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>CP desde</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.INTERIOR.min}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                INTERIOR: {...config.entrega.envio.costos.INTERIOR, min: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CP hasta</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.INTERIOR.max}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                INTERIOR: {...config.entrega.envio.costos.INTERIOR, max: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costo ($)</Label>
                    <Input
                      type="number"
                      value={config.entrega.envio.costos.INTERIOR.costo}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrega: {
                            ...config.entrega,
                            envio: {
                              ...config.entrega.envio,
                              costos: {
                                ...config.entrega.envio.costos,
                                INTERIOR: {...config.entrega.envio.costos.INTERIOR, costo: parseInt(e.target.value) || 0},
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Numero de WhatsApp</Label>
              <Input
                value={config.whatsapp || ""}
                onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
                placeholder="Ej: 5491112345678 (sin +, sin espacios)"
              />
              <p className="text-sm text-muted-foreground">
                Incluí el codigo de pais. Ej: 54 (Argentina) + codigo de area + numero
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}