import { Button } from '@/components/ui/button'
import { debugAdminData } from './actions'

export default function DebugPage() {
    return (
        <div className="p-10">
            <h1>Debug Admin Visibility</h1>
            <form action={debugAdminData}>
                <Button>Run Debug Check</Button>
            </form>
        </div>
    )
}
