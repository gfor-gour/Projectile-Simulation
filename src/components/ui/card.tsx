import React from "react"

export const Card = ({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`rounded-lg shadow-md p-4 ${className}`}>{children}</div>
)

export const CardHeader = ({ children }: React.PropsWithChildren) => (
  <div className="mb-2">{children}</div>
)

export const CardTitle = ({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) => (
  <h2 className={`font-bold text-lg ${className}`}>{children}</h2>
)

export const CardContent = ({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={className}>{children}</div>
)