import Search from '@/components/shared/Search'
import { getOrdersByEvent } from '@/lib/actions/order.actions'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { SearchParamProps } from '@/types'
import { IOrderItem } from '@/lib/database/models/order.model'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const Orders = async ({ searchParams }: SearchParamProps) => {
  const eventId = (searchParams?.eventId as string) || ''
  const searchText = (searchParams?.query as string) || ''

  const orders = await getOrdersByEvent({ eventId, searchString: searchText })

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Event Registrations</h3>
      </section>

      <section className="wrapper mt-8">
        <Search placeholder="Search registrant name..." />
      </section>

      <section className="wrapper overflow-x-auto">
        <table className="w-full border-collapse border-t">
          <thead>
            <tr className="p-medium-14 border-b text-grey-500">
              <th className="min-w-[250px] py-3 text-left">Order ID</th>
              <th className="min-w-[200px] flex-1 py-3 pr-4 text-left">Event Title</th>
              <th className="min-w-[150px] py-3 text-left">Registrant</th>
              <th className="min-w-[100px] py-3 text-left">Created</th>
              <th className="min-w-[100px] py-3 text-right">Amount</th>
              <th className="min-w-[100px] py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length === 0 ? (
              <tr className="border-b">
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No registrations found.
                </td>
              </tr>
            ) : (
              <>
                {orders &&
                  orders.map((row: IOrderItem) => (
                    <Collapsible key={row._id} asChild>
                      <>
                        <tr className="p-regular-14 lg:p-regular-16 border-b">
                          <td className="min-w-[250px] py-4 text-primary-500">{row._id}</td>
                          <td className="min-w-[200px] flex-1 py-4 pr-4">{row.eventTitle}</td>
                          <td className="min-w-[150px] py-4">{row.buyerName}</td>
                          <td className="min-w-[100px] py-4">
                            {formatDateTime(row.createdAt.toISOString()).dateTime}
                          </td>
                          <td className="min-w-[100px] py-4 text-right">
                            {formatPrice(row.totalAmount)}
                          </td>
                          <td className="min-w-[100px] py-4 text-center">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full">
                                View Details
                              </Button>
                            </CollapsibleTrigger>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={6} className="border-b">
                            <CollapsibleContent>
                              <div className="p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Basic Info */}
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={row.buyerDetails.photo}
                                        alt={row.buyerDetails.firstName}
                                        className="rounded-full w-20 h-20 object-cover"
                                      />
                                      <div>
                                        <h4 className="font-semibold">{row.buyerName}</h4>
                                        <p className="text-gray-600">{row.buyerDetails.email}</p>
                                        <p className="text-gray-600">@{row.buyerDetails.username}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contact Info */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold">Contact Details</h4>
                                    <p className="text-gray-600">
                                      Phone: {row.buyerDetails.phoneNumber || 'Not provided'}
                                    </p>
                                  </div>

                                  {/* Education Info */}
                                  <div className="space-y-2 md:col-span-2">
                                    <h4 className="font-semibold">Education Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <p className="text-gray-600">
                                        College: {row.buyerDetails.collegeName || 'Not provided'}
                                      </p>
                                      <p className="text-gray-600">
                                        Degree: {row.buyerDetails.degree || 'Not provided'}
                                      </p>
                                      <p className="text-gray-600">
                                        Specialization: {row.buyerDetails.specialization || 'Not provided'}
                                      </p>
                                      <p className="text-gray-600">
                                        Duration: {row.buyerDetails.graduationStartYear 
                                          ? `${row.buyerDetails.graduationStartYear} - ${row.buyerDetails.graduationEndYear || 'Present'}`
                                          : 'Not provided'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </td>
                        </tr>
                      </>
                    </Collapsible>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default Orders
