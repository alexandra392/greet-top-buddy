import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, ChevronLeft, ChevronRight, Plus, ChevronRight as ChevronRightIcon, CheckCircle, Building2, Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyDetailModal } from "@/components/CompanyDetailModal";
import { CompaniesMap } from "@/components/CompaniesMap";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import React from "react";

interface Company {
  id: string;
  company_name: string;
  company_type: string;
  entity_type: 'company' | 'project';
  country: string;
  sector: string;
  application: string;
  state: string;
  fit: number;
  website?: string;
  headquarters?: string;
  address?: string;
  founded?: number;
  employee_range?: string;
  annual_revenue?: string;
  description?: string;
  patents_count?: number;
  projects_count?: number;
  publications_count?: number;
  contact_email?: string;
  contact_phone?: string;
  // Project-specific fields
  scale?: 'Industrial' | 'Pilot' | 'N/A';
  source?: string;
  partners?: string;
}

const MarketActivityReview = () => {
  const { category, topic } = useParams<{ category: string; topic: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get passed state
  const { savedCompanies: savedCompanyIds = [], companies: allCompanies = [], pathwayNumber } = location.state || {};
  
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set(savedCompanyIds));
  const [companies] = useState<Company[]>(allCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackedCompanies, setTrackedCompanies] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('feedstock');

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleSaveCompany = (companyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSavedCompanies(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      
      return newSet;
    });
  };

  const handleBackToEditing = () => {
    navigate(`/landscape/${category}/${topic}/market-activity`, {
      state: { 
        savedCompanies: Array.from(savedCompanies),
        pathwayNumber 
      }
    });
  };

  const handleFinalise = () => {
    navigate(`/landscape/${category}/${topic}/value-chain/pathways/${pathwayNumber || 1}`);
  };

  const getAllSavedCompanies = () => {
    return companies.filter(company => savedCompanies.has(company.id));
  };

  const getSavedCompaniesByType = (type: string) => {
    if (type === 'all') return getAllSavedCompanies();
    if (type === 'projects') {
      return companies.filter(company => savedCompanies.has(company.id) && company.entity_type === 'project');
    }
    return companies.filter(company => savedCompanies.has(company.id) && company.company_type === type && company.entity_type === 'company');
  };

  const getTotalSavedCount = () => {
    return savedCompanies.size;
  };

  const getCountByType = (type: string) => {
    if (type === 'all') return savedCompanies.size;
    if (type === 'projects') {
      return companies.filter(company => savedCompanies.has(company.id) && company.entity_type === 'project').length;
    }
    return companies.filter(company => savedCompanies.has(company.id) && company.company_type === type && company.entity_type === 'company').length;
  };

  const getCompanySize = (revenue?: string) => {
    if (!revenue) return 'Unknown';
    
    const numbers = revenue.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 'Unknown';
    
    const value = parseInt(numbers[0]);
    const isBillion = revenue.toLowerCase().includes('b');
    const actualValue = isBillion ? value * 1000 : value;
    
    if (actualValue < 10) return 'SME';
    if (actualValue < 50) return 'Medium';
    if (actualValue < 500) return 'Large';
    return 'Enterprise';
  };

  const getCategoryLabel = (type: string) => {
    switch(type) {
      case 'feedstock': return 'Feedstock';
      case 'technology': return 'Technology';
      case 'product': return 'Product';
      case 'market_uptaker': return 'Market Off-taker';
      default: return type;
    }
  };

  const SavedCompaniesTable = ({ companyType }: { companyType: string }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const savedCompaniesList = getSavedCompaniesByType(companyType);

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(savedCompaniesList.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCompanies = savedCompaniesList.slice(startIndex, endIndex);

    // Reset to page 1 when company type or items per page changes
    useEffect(() => {
      setCurrentPage(1);
    }, [companyType, itemsPerPage]);

    return (
      <div className="flex flex-col h-full min-h-0 border border-gray-300 rounded-lg bg-white shadow-md overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Table className="table-fixed w-full">
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <TableHeader className="bg-gradient-to-b from-gray-100 to-gray-50 sticky top-0 z-10">
              <TableRow className="border-b border-gray-300">
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-center">Save</TableHead>
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-left">
                  {companyType === 'projects' ? 'Project Name' : 'Company Name'}
                </TableHead>
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-left">Country</TableHead>
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-left">
                  {companyType === 'projects' ? 'Scale' : 'Size'}
                </TableHead>
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-center">Fit Score</TableHead>
                <TableHead className="font-semibold text-[10px] h-8 py-1.5 text-gray-800 uppercase tracking-wider text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedCompaniesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                    No saved companies
                  </TableCell>
                </TableRow>
              ) : (
                currentCompanies.map((company) => {
                  const companyType = company.company_type;
                  
                  return (
                    <TableRow key={company.id} className="bg-white hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100 last:border-0">
                      <TableCell className="text-center py-2 bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleSaveCompany(company.id, e)}
                          className={`h-6 w-6 p-0 rounded-md border shadow hover:shadow-md transition-all active:shadow-sm ${
                            savedCompanies.has(company.id)
                              ? companyType === 'feedstock' 
                                ? 'bg-green-100 border-green-500 hover:bg-green-200'
                                : companyType === 'technology'
                                ? 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                                : companyType === 'product'
                                ? 'bg-purple-100 border-purple-500 hover:bg-purple-200'
                                : 'bg-orange-100 border-orange-500 hover:bg-orange-200'
                              : 'bg-white hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          <Plus 
                            className={`h-3.5 w-3.5 ${
                              savedCompanies.has(company.id)
                                ? companyType === 'feedstock'
                                  ? 'text-green-700'
                                  : companyType === 'technology'
                                  ? 'text-blue-700'
                                  : companyType === 'product'
                                  ? 'text-purple-700'
                                  : 'text-orange-700'
                                : 'text-gray-700'
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="py-2 bg-white">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-900">{company.company_name}</span>
                          {company.entity_type !== 'project' && (
                            <div className="flex gap-1 items-center text-[11px] whitespace-nowrap">
                              <span className="text-gray-700 font-medium">{company.sector}</span>
                              <ChevronRightIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-500">{company.application}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-2 bg-white text-gray-600">{company.country}</TableCell>
                      <TableCell className="text-xs py-2 bg-white text-gray-600">
                        {companyType === 'projects' ? (company.scale === 'N/A' ? 'Unknown' : company.scale || 'Unknown') : getCompanySize(company.annual_revenue)}
                      </TableCell>
                      <TableCell className="text-center py-2 bg-white">
                        <Badge 
                          variant="outline"
                          className={
                            company.fit >= 90 
                              ? companyType === 'feedstock'
                                ? 'bg-green-50 text-green-700 border-green-300 px-2.5 py-0.5 rounded-md font-semibold shadow-sm text-[11px]'
                                : companyType === 'technology'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 px-2.5 py-0.5 rounded-md font-semibold shadow-sm text-[11px]'
                                : companyType === 'product'
                                ? 'bg-purple-50 text-purple-700 border-purple-300 px-2.5 py-0.5 rounded-md font-semibold shadow-sm text-[11px]'
                                : companyType === 'market_uptaker'
                                ? 'bg-orange-50 text-orange-700 border-orange-300 px-2.5 py-0.5 rounded-md font-semibold shadow-sm text-[11px]'
                                : 'bg-gray-50 text-gray-700 border-gray-300 px-2.5 py-0.5 rounded-md font-semibold shadow-sm text-[11px]'
                              : 'bg-gray-50 text-gray-600 border-gray-300 px-2.5 py-0.5 rounded-md font-medium shadow-sm text-[11px]'
                          }
                        >
                          {company.fit >= 90 ? 'Exact' : 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-2 bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompanyClick(company)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <Info className="h-3.5 w-3.5 text-gray-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-300 bg-gradient-to-b from-white to-gray-50 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium">
            {savedCompaniesList.length === 0 ? (
              <span>No companies saved</span>
            ) : (
              <>
                <span>Showing {startIndex + 1}</span>
                <span>-</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="h-5 w-[50px] text-[10px] border-gray-300 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="text-[10px]">5</SelectItem>
                    <SelectItem value="10" className="text-[10px]">10</SelectItem>
                    <SelectItem value="20" className="text-[10px]">20</SelectItem>
                    <SelectItem value="50" className="text-[10px]">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>of {savedCompaniesList.length} companies</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || savedCompaniesList.length === 0}
              className="h-6 w-6 p-0 hover:bg-blue-50 transition-colors border-gray-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-gray-700 min-w-[80px] text-center font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || savedCompaniesList.length === 0}
              className="h-6 w-6 p-0 hover:bg-blue-50 transition-colors border-gray-300"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 pb-4">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleBackToEditing} className="gap-1.5 h-7 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm hover:shadow-md px-6"
              onClick={handleFinalise}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalise
            </Button>
          </div>

          {/* Main Content Container */}
          <div style={{ height: 'calc(100vh - 132px)' }} className="relative">
            <Card className="bg-gradient-to-br from-card to-card/90 border border-border/40 shadow-lg backdrop-blur-sm h-full flex flex-col overflow-hidden">
              <CardContent className="px-6 pt-6 pb-4 flex flex-col overflow-hidden h-full">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                <span className="text-lg font-bold text-gray-700">2</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Saved Candidates ({getTotalSavedCount()})
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Review and manage your saved candidates for potential partnerships and collaborations.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted/30 p-1 rounded-lg">
                <TabsTrigger 
                  value="feedstock"
                  className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm transition-all"
                >
                  <span className="text-xs font-medium">Feedstock Providers ({getCountByType('feedstock')})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="technology"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                >
                  <span className="text-xs font-medium">Technology Providers ({getCountByType('technology')})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="product"
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                >
                  <span className="text-xs font-medium">Product Producers ({getCountByType('product')})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="market_uptaker"
                  className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm transition-all"
                >
                  <span className="text-xs font-medium">Market Off-takers ({getCountByType('market_uptaker')})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="projects"
                  className="data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 transition-all"
                >
                  <span className="text-xs font-medium">Projects ({getCountByType('projects')})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'projects' ? (
              <div className="flex-1 overflow-hidden">
                <SavedCompaniesTable companyType={activeTab} />
              </div>
            ) : (
              <div className="grid gap-4 items-stretch flex-1 overflow-hidden min-h-0 max-h-full" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                <div className="h-full overflow-hidden">
                  <SavedCompaniesTable companyType={activeTab} />
                </div>
                <div className="h-full overflow-hidden">
                  <CompaniesMap companies={getSavedCompaniesByType(activeTab)} savedCompanies={savedCompanies} useSavedView={true} />
                </div>
              </div>
            )}
          </div>
         </CardContent>
       </Card>
       </div>

       <CompanyDetailModal
         company={selectedCompany}
         open={isModalOpen}
         onOpenChange={setIsModalOpen}
         isTracked={selectedCompany ? trackedCompanies.has(selectedCompany.id) : false}
         onToggleTracking={(companyId) => {
           setTrackedCompanies(prev => {
             const newSet = new Set(prev);
             if (newSet.has(companyId)) {
               newSet.delete(companyId);
             } else {
               newSet.add(companyId);
             }
             return newSet;
           });
         }}
       />
        </div>
      </div>
    </div>
  );
};

export default MarketActivityReview;
