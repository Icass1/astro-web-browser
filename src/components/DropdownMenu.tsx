import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Share2, Edit, Trash, Download } from "lucide-react"
import { Button } from './ui/button';
import { toast } from 'sonner';
import '@/styles/globals.css'

export default function FileDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className='hover:bg-muted transition-colors rounded'>
          <DropdownMenuItem onClick={() => { console.log("rename"); toast("rename") }}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
        </div>
        <div className='hover:bg-muted transition-colors rounded'>
          <DropdownMenuItem >
            <Download className="mr-2 h-4 w-4" />
            <span>Download</span>
          </DropdownMenuItem>
        </div>
        <div className='hover:bg-muted transition-colors rounded'>
          <DropdownMenuItem>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className='hover:bg-destructive transition-colors rounded'>
          <DropdownMenuItem>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
