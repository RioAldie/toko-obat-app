"use server"

import { revalidatePath } from "next/cache"
import { fetchApi } from "./api"

// Generic create action
export async function createRecord(endpoint: string, data: any, pathToRevalidate: string) {
  try {
    await fetchApi(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
    revalidatePath(pathToRevalidate)
    revalidatePath("/") // Always revalidate dashboard stats
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Generic delete action
export async function deleteRecord(endpoint: string, id: string, pathToRevalidate: string) {
  try {
    await fetchApi(`${endpoint}/${id}`, {
      method: "DELETE",
    })
    revalidatePath(pathToRevalidate)
    revalidatePath("/") // Always revalidate dashboard stats
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Generic get action
export async function getRecord(endpoint: string) {
  try {
    const data = await fetchApi(endpoint)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Generic update action
export async function updateRecord(endpoint: string, id: string, data: any, pathToRevalidate: string) {
  try {
    await fetchApi(`${endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    revalidatePath(pathToRevalidate)
    revalidatePath("/") // Always revalidate dashboard stats
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
