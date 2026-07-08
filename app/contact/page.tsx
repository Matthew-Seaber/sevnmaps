import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        Contact Us
      </h1>
      <p className="mb-8">
        Get in touch with the SevnMaps team with any questions or feedback you
        may have!
      </p>

      <form className="mb-6 border border-border flex flex-col gap-4 rounded-xl p-4">
        <h3>Your details</h3>
        <div className="flex flex-row gap-2 sm:w-lg flex-wrap sm:flex-nowrap">
          <Input
            type="text"
            placeholder="First name"
            className="px-3 py-5 w-full sm:w-1/3"
          />
          <Input
            type="email"
            placeholder="Email address"
            className="px-3 py-5 w-full sm:w-2/3"
          />
        </div>

        <h3>Your message</h3>
        <div className="flex flex-row gap-2 sm:w-lg flex-wrap sm:flex-nowrap">
          <Input type="text" placeholder="Subject" className="px-3 py-5" />
          <Select>
            <SelectTrigger className="w-full px-3 py-5">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select category</SelectLabel>

                <SelectItem value="Account help">Account help</SelectItem>
                <SelectItem value="Subscription query">Subscription query</SelectItem>
                <SelectItem value="Billing question">Billing question</SelectItem>
                <SelectItem value="Technical support">Technical support</SelectItem>
                <SelectItem value="General feedback">General feedback</SelectItem>
                <SelectItem value="Feature request">Feature request</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <textarea
          placeholder="Your message"
          className="px-3 py-3 border border-input rounded-md resize-vertical min-h-48"
        />

        <div className="w-full flex justify-center">
          <Button size="lg" className="h-10 px-6">
            Send message
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContactPage;
