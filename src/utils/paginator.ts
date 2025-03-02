export const paginationConfigure = (meta: { page: number; pageSize: number; total: number }) => ({
    current: meta?.page,
    pageSize: meta?.pageSize,
    showSizeChanger: true,
    total: meta?.total,
    showTotal: (total: number, range: number[]) => (
        `${range[0]} - ${range[1]} trên ${total} hàng`
    ),
})
