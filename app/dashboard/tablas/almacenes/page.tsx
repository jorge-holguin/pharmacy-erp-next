"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash, FileSpreadsheet, ArrowLeft, Filter, RefreshCw, Printer } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function AlmacenesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Datos de ejemplo
  const almacenes = [
    { id: 1, codigo: "P", nombre: "ALMACEN DE PRUEBA", activo: "1" },
    { id: 2, codigo: "A", nombre: "ALMACEN GENERAL(MEDICAMENTOS)", activo: "1" },
    { id: 3, codigo: "F", nombre: "FARMACIA EMERGENCIA", activo: "1" },
    { id: 4, codigo: "C", nombre: "FARMACIA INMUNIZACION", activo: "1" },
    { id: 5, codigo: "SO", nombre: "C.P. SALA DE OPERACIONES", activo: "1" },
    { id: 6, codigo: "CI", nombre: "C.P. CIRUGIA", activo: "1" },
    { id: 7, codigo: "GO", nombre: "C.P. GINECO OBSTETRICIA", activo: "1" },
    { id: 8, codigo: "V", nombre: "VENCIDOS", activo: "0" },
    { id: 9, codigo: "PE", nombre: "C.P. PEDIATRIA", activo: "1" },
    { id: 10, codigo: "ME", nombre: "C.P. MEDICINA", activo: "1" },
  ]

  // Filtrar almacenes basado en el término de búsqueda
  const filteredAlmacenes = almacenes.filter(
    (almacen) =>
      almacen.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      almacen.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Manejar selección de todos los items
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredAlmacenes.map((item) => item.id))
    }
    setSelectAll(!selectAll)
  }

  // Manejar selección individual
  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
      setSelectAll(false)
    } else {
      setSelectedItems([...selectedItems, id])
      if (selectedItems.length + 1 === filteredAlmacenes.length) {
        setSelectAll(true)
      }
    }
  }

  const handleRefresh = () => {
    setSearchTerm("")
    toast({
      title: "Actualizado",
      description: "La lista ha sido actualizada",
    })
  }

  const handlePrint = () => {
    toast({
      title: "Imprimiendo",
      description: "Enviando documento a la impresora",
    })
  }

  const handleExport = () => {
    toast({
      title: "Exportando",
      description: "Exportando datos a Excel",
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tabla de Almacenes</h1>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Buscar por código o nombre..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Almacén
          </Button>

          <Button variant="outline" disabled={selectedItems.length !== 1}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <Button variant="outline" disabled={selectedItems.length === 0}>
            <Trash className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>

          <Link href="/dashboard/tablas">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Seleccionar todos" />
                  </TableHead>
                  <TableHead>ALMACEN</TableHead>
                  <TableHead>NOMBRE</TableHead>
                  <TableHead>ACTIVO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlmacenes.length > 0 ? (
                  filteredAlmacenes.map((almacen) => (
                    <TableRow key={almacen.id} className={selectedItem === almacen.id ? "bg-primary/10" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(almacen.id)}
                          onCheckedChange={() => handleSelectItem(almacen.id)}
                          aria-label={`Seleccionar almacén ${almacen.codigo}`}
                        />
                      </TableCell>
                      <TableCell onClick={() => setSelectedItem(almacen.id)}>{almacen.codigo}</TableCell>
                      <TableCell onClick={() => setSelectedItem(almacen.id)}>{almacen.nombre}</TableCell>
                      <TableCell onClick={() => setSelectedItem(almacen.id)}>{almacen.activo}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

