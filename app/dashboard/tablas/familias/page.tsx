"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash, FileSpreadsheet, ArrowLeft, Filter, RefreshCw, Printer } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import { EditDialog } from "@/components/edit-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { printData } from "@/components/utils/print-helper"
import { exportToCSV } from "@/components/utils/export-helper"

interface Familia {
  FAMILIA: string
  NOMBRE: string
  ACTIVO: string | number 
}

export default function FamiliasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [familias, setFamilias] = useState<Familia[]>([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [filterActive, setFilterActive] = useState<string | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  
  // Función para cargar las familias desde la API
  const loadFamilias = async () => {
    setLoading(true)
    try {
      const skip = (currentPage - 1) * pageSize
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
      const activeParam = filterActive !== null ? `&active=${filterActive}` : ''
      
      const response = await fetch(`/api/tablas/familias?take=${pageSize}&skip=${skip}${searchParam}${activeParam}`)
      if (!response.ok) throw new Error('Error al cargar familias')
      const data = await response.json()
      setFamilias(data)
      
      // Obtener el conteo total para la paginación
      try {
        const countResponse = await fetch(`/api/tablas/familias/count${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}${activeParam}`)
        if (!countResponse.ok) {
          const errorText = await countResponse.text()
          console.error('Error en la respuesta del conteo:', errorText)
          // No lanzar error, usar la longitud de los datos como fallback
          setTotalItems(data.length)
        } else {
          const { count } = await countResponse.json()
          setTotalItems(count)
        }
      } catch (countError) {
        console.error('Error al obtener el conteo:', countError)
        setTotalItems(data.length)
      }
    } catch (error) {
      console.error('Error loading familias:', error)
      toast({
        title: "Error",
        description: "Error al cargar las familias",
        variant: "destructive"
      })
      setFamilias([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al iniciar y cuando cambien los filtros
  useEffect(() => {
    loadFamilias()
  }, [currentPage, pageSize])

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Resetear a la primera página al buscar
      loadFamilias()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Manejar selección de todos los items
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      setSelectedItems(familias.map((item) => item.FAMILIA))
    }
    setSelectAll(!selectAll)
  }

  // Manejar selección individual
  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
      setSelectAll(false)
    } else {
      setSelectedItems([...selectedItems, id])
      if (selectedItems.length + 1 === familias.length) {
        setSelectAll(true)
      }
    }
  }

  const handleRefresh = () => {
    setSearchTerm("")
    setSelectedItems([])
    setSelectAll(false)
    setCurrentPage(1)
    setFilterActive(null)
    loadFamilias()
    toast({
      title: "Actualizado",
      description: "La lista ha sido actualizada",
    })
  }

  const handlePrint = async () => {
    try {
      await printData({
        title: "Tabla de Familias",
        data: familias,
        columns: [
          { key: "FAMILIA", header: "FAMILIA" },
          { key: "NOMBRE", header: "NOMBRE" },
          { 
            key: "ACTIVO", 
            header: "ACTIVO",
            format: (value) => Number(value) === 1 ? 'Sí' : 'No'
          }
        ]
      })
      
      toast({
        title: "Imprimiendo",
        description: "Enviando documento a la impresora",
      })
    } catch (error) {
      console.error('Error al imprimir:', error)
      toast({
        title: "Error",
        description: "Error al imprimir el documento",
        variant: "destructive"
      })
    }
  }

  const handleExport = () => {
    const success = exportToCSV({
      filename: "familias",
      data: familias,
      columns: [
        { key: "FAMILIA", header: "FAMILIA" },
        { key: "NOMBRE", header: "NOMBRE" },
        { 
          key: "ACTIVO", 
          header: "ACTIVO",
          format: (value) => Number(value) === 1 ? 'Sí' : 'No'
        }
      ]
    })
    
    if (success) {
      toast({
        title: "Exportando",
        description: "Datos exportados a CSV correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "Error al exportar los datos",
        variant: "destructive"
      })
    }
  }

  const handleEdit = () => {
    if (selectedItems.length !== 1) return

    const itemToEdit = familias.find((item) => item.FAMILIA === selectedItems[0])
    if (itemToEdit) {
      setSelectedItem(itemToEdit.FAMILIA)
      setEditDialogOpen(true)
    }
  }

  const handleNew = () => {
    setSelectedItem(null)
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (selectedItems.length === 0) return
    setConfirmDialogOpen(true)
  }

  const handleSaveItem = async (data: any) => {
    try {
      if (selectedItem) {
        // Actualizar familia existente
        const response = await fetch(`/api/tablas/familias/${selectedItem}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) throw new Error('Error al actualizar familia')
        
        toast({
          title: "Familia actualizada",
          description: `La familia ${data.NOMBRE} ha sido actualizada correctamente`,
        })
      } else {
        // Crear nueva familia
        const response = await fetch('/api/tablas/familias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) throw new Error('Error al crear familia')
        
        toast({
          title: "Familia creada",
          description: `La familia ${data.NOMBRE} ha sido creada correctamente`,
        })
      }
      
      // Recargar datos después de guardar
      loadFamilias()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error saving familia:', error)
      toast({
        title: "Error",
        description: "Error al guardar la familia",
        variant: "destructive"
      })
    }
  }

  const confirmDelete = async () => {
    try {
      // Si hay múltiples elementos seleccionados, eliminarlos uno por uno
      const deletePromises = selectedItems.map(id => 
        fetch(`/api/tablas/familias/${id}`, {
          method: 'DELETE',
        })
      )
      
      await Promise.all(deletePromises)
      
      toast({
        title: "Familias eliminadas",
        description: `Se han eliminado ${selectedItems.length} familias correctamente`,
      })
      
      // Recargar datos después de eliminar
      loadFamilias()
      setSelectedItems([])
      setSelectAll(false)
      setConfirmDialogOpen(false)
    } catch (error) {
      console.error('Error deleting familias:', error)
      toast({
        title: "Error",
        description: "Error al eliminar las familias",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tabla de Familias</h1>

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

        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros {filterActive !== null && <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={filterActive !== null ? filterActive : 'all'} 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setFilterActive(null)
                    } else {
                      setFilterActive(value)
                    }
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">Activos</SelectItem>
                    <SelectItem value="0">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={() => {
                  setCurrentPage(1)
                  loadFamilias()
                }}>
                  Aplicar filtros
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Familia
          </Button>

          <Button variant="outline" onClick={handleEdit} disabled={selectedItems.length !== 1}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <Button variant="outline" onClick={handleDelete} disabled={selectedItems.length === 0}>
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
                  <TableHead>FAMILIA</TableHead>
                  <TableHead>NOMBRE</TableHead>
                  <TableHead>ACTIVO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : familias.length > 0 ? (
                  familias.map((familia) => (
                    <TableRow key={familia.FAMILIA} className={selectedItems.includes(familia.FAMILIA) ? "bg-primary/10" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(familia.FAMILIA)}
                          onCheckedChange={() => handleSelectItem(familia.FAMILIA)}
                          aria-label={`Seleccionar familia ${familia.FAMILIA}`}
                        />
                      </TableCell>
                      <TableCell>{familia.FAMILIA}</TableCell>
                      <TableCell>{familia.NOMBRE}</TableCell>
                      <TableCell>{Number(familia.ACTIVO) === 1 ? "Sí" : "No"}</TableCell>
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

      <Pagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveItem}
        title={selectedItem ? "Editar Familia" : "Nueva Familia"}
        defaultValues={selectedItem ? familias.find(item => item.FAMILIA === selectedItem) : { ACTIVO: "1" }}
        fields={[
          { name: "FAMILIA", label: "Código", type: "text", required: true, readOnly: !!selectedItem },
          { name: "NOMBRE", label: "Nombre", type: "text", required: true },
          { 
            name: "ACTIVO", 
            label: "Activo", 
            type: "select", 
            required: true,
            options: [
              { value: "1", label: "Sí" },
              { value: "0", label: "No" }
            ]
          }
        ]}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmDelete}
        title="¿Está seguro de eliminar?"
        description={`Está a punto de eliminar ${selectedItems.length} ${selectedItems.length === 1 ? "familia" : "familias"}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  )
}
