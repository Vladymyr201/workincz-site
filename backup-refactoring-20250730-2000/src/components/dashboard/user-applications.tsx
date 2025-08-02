"use client";

import React from "react";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Loader2,
  MapPin,
  Building,
  Calendar
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserApplicationsProps {
  limit?: number;
}

export function UserApplications({ limit = 5 }: UserApplicationsProps) {
  const { applications, loading, error } = useApplications({ limit });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "На рассмотрении";
      case "accepted":
        return "Принята";
      case "rejected":
        return "Отклонена";
      default:
        return "Неизвестно";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Мои заявки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            Мои заявки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Ошибка загрузки заявок: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Мои заявки
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/applications" className="flex items-center gap-1">
              Все заявки
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>У вас пока нет заявок</p>
            <Button className="mt-4" asChild>
              <a href="/jobs">Найти вакансии</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, limit).map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {application.jobTitle}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{getStatusText(application.status)}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{application.companyName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Подана {formatDate(application.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={`/applications/${application.id}`}>
                    Подробнее
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 