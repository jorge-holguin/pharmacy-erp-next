import { NextRequest, NextResponse } from 'next/server'
import { ClaseService } from '@/services/clase.service'
import { Prisma } from '@prisma/client'

const claseService = new ClaseService()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const take = searchParams.get('take') ? Number(searchParams.get('take')) : 10
    const skip = searchParams.get('skip') ? Number(searchParams.get('skip')) : 0
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    
    let where: Prisma.CLASEWhereInput = {}
    
    // Add search filter if provided
    if (search) {
      where = {
        OR: [
          { CLASE: { contains: search } },
          { NOMBRE: { contains: search } }
        ]
      }
    }
    
    // Add active filter if provided
    if (active !== null && active !== undefined) {
      where = {
        ...where,
        ACTIVO: active
      }
    }
    
    const clases = await claseService.findAll({ take, skip, where })
    return NextResponse.json(clases)
  } catch (error) {
    console.error('Error fetching clases:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const clase = await claseService.create(data)
    return NextResponse.json(clase, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
