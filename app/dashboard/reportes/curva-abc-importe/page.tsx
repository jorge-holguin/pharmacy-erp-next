"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer } from "lucide-react"

export default function CurvaABCImportePage() {
  const [userName, setUserName] = useState("JHOLGUIN")
  const [currentDate, setCurrentDate] = useState("")
  const [almacen, setAlmacen] = useState("FARMACIA")
  const periodo = "Marzo 2025"
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [origen, setOrigen] = useState("")
  const [tipoAtencion, setTipoAtencion] = useState("")
  const [tipoReporte, setTipoReporte] = useState("")

  // Actualizar fecha
  useEffect(() => {
    const now = new Date()
    const formattedDate = now
      .toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/")

    setCurrentDate(formattedDate)
    setFechaDesde(formattedDate)
    setFechaHasta(formattedDate)

    // Obtener información del usuario del localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("hospital-user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setUserName(user.name || "JHOLGUIN")
      }
    }
  }, [])

  const handleImprimir = () => {
    alert("Generando reporte de Curva ABC Importe...")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Curva ABC Importe</h1>
          <p className="text-muted-foreground text-sm">Análisis ABC por importe</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/reportes">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Información de usuario, fecha, almacén y periodo */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md flex flex-wrap justify-between">
        <div>
          Usuario: <span className="font-medium">{userName}</span>
        </div>
        <div>
          Fecha: <span className="font-medium">{currentDate}</span>
        </div>
        <div>
          Almacén: <span className="font-medium">{almacen}</span>
        </div>
        <div>
          Periodo: <span className="font-medium">{periodo}</span>
        </div>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Curva ABC Importe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-right pt-2">
              <Label htmlFor="fechaDesde">Desde:</Label>
            </div>
            <div className="col-span-3">
              <Select defaultValue={fechaDesde || currentDate}>
                <SelectTrigger id="fechaDesde">
                  <SelectValue placeholder="Fecha desde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentDate}>{currentDate}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-right pt-2">
              <Label htmlFor="fechaHasta">Hasta:</Label>
            </div>
            <div className="col-span-3">
              <Select defaultValue={fechaHasta || currentDate}>
                <SelectTrigger id="fechaHasta">
                  <SelectValue placeholder="Fecha hasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentDate}>{currentDate}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-right pt-2">
              <Label htmlFor="origen">Origen:</Label>
            </div>
            <div className="col-span-3">
              <Input id="origen" value={origen} onChange={(e) => setOrigen(e.target.value)} />
            </div>

            <div className="text-right pt-2">
              <Label htmlFor="tipoAtencion">Tipo de Atención:</Label>
            </div>
            <div className="col-span-3">
              <Input id="tipoAtencion" value={tipoAtencion} onChange={(e) => setTipoAtencion(e.target.value)} />
            </div>

            <div className="text-right pt-2">
              <Label htmlFor="tipoReporte">Tipo de Reporte:</Label>
            </div>
            <div className="col-span-3">
              <Select defaultValue={tipoReporte}>
                <SelectTrigger id="tipoReporte">
                  <SelectValue placeholder="Seleccionar tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detallado">Detallado</SelectItem>
                  <SelectItem value="resumido">Resumido</SelectItem>
                  <SelectItem value="estadistico">Estadístico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button className="gap-1" onClick={handleImprimir}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Link href="/dashboard/reportes">
              <Button variant="outline">Salir</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

