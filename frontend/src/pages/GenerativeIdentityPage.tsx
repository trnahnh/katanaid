import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const VIBE_OPTIONS = [
  { value: "random", label: "Surprise me" },
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "techy", label: "Techy" },
  { value: "elegant", label: "Elegant" },
  { value: "quirky", label: "Quirky" },
] as const;

const STYLE_OPTIONS = [
  { value: "realistic", label: "Realistic" },
  { value: "anime", label: "Anime" },
  { value: "cartoon", label: "Cartoon" },
  { value: "pixel", label: "Pixel Art" },
  { value: "watercolor", label: "Watercolor" },
  { value: "minimalist", label: "Minimalist" },
] as const;

const TRAIT_OPTIONS = {
  hair: ["Short", "Long", "Curly", "Wavy", "Bald"],
  expression: ["Smiling", "Serious", "Mysterious", "Friendly", "Confident"],
  background: ["Solid color", "Nature", "Abstract", "Gradient", "None"],
} as const;

const GenerativeIdentityPage = () => {
  const [selectedVibe, setSelectedVibe] = useState("random");
  const [count, setCount] = useState("5");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState("anime");
  const [selectedHair, setSelectedHair] = useState("Short");
  const [selectedExpression, setSelectedExpression] = useState("Friendly");
  const [selectedBackground, setSelectedBackground] = useState("Solid color");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/api/identity/username", {
        vibe: selectedVibe,
        count: count,
      });

      // Parse CSV response into array, trim whitespace
      const parsedUsernames = response.data.usernames
        .split(",")
        .map((name: string) => name.trim())
        .filter((name: string) => name.length > 0);

      setUsernames(parsedUsernames);
    } catch (error) {
      toast.error("Failed to generate usernames");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyAllUsernames = () => {
    navigator.clipboard.writeText(usernames.join("\n"));
    toast.success("All usernames copied!");
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const traits = `${selectedHair} hair, ${selectedExpression} expression, ${selectedBackground} background`;
      
      const response = await axiosInstance.post("/api/identity/avatar", {
        style: selectedStyle,
        traits: traits,
      });
  
      setAvatarImage(response.data.image);
    } catch (error) {
      toast.error("Failed to generate avatar");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };
  
  const downloadAvatar = () => {
    if (!avatarImage) return;
    
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${avatarImage}`;
    link.download = "avatar.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Avatar downloaded!");
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Username Generator</CardTitle>
          <CardDescription>
            Select a vibe and how many usernames you want.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selection controls */}
          <div className="flex flex-wrap gap-4">
            {/* Vibe Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vibe</label>
              <Select value={selectedVibe} onValueChange={setSelectedVibe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select vibe" />
                </SelectTrigger>
                <SelectContent>
                  {VIBE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Count</label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Usernames"}
          </Button>

          {/* Results Section */}
          {usernames.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generated Usernames</span>
                <Button variant="outline" size="sm" onClick={copyAllUsernames}>
                  Copy All
                </Button>
              </div>

              <div className="grid gap-2">
                {usernames.map((username, index) => (
                  <div
                    key={index}
                    onClick={() => copyToClipboard(username)}
                    className="p-3 rounded-md border bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-sm">{username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avatar Generator Card */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Generator</CardTitle>
          <CardDescription>
            Select a style and traits to generate your profile picture.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Style and Trait Selects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Style Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hair Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hair</label>
              <Select value={selectedHair} onValueChange={setSelectedHair}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hair" />
                </SelectTrigger>
                <SelectContent>
                  {TRAIT_OPTIONS.hair.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expression Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Expression</label>
              <Select value={selectedExpression} onValueChange={setSelectedExpression}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expression" />
                </SelectTrigger>
                <SelectContent>
                  {TRAIT_OPTIONS.expression.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Background Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Background</label>
              <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  {TRAIT_OPTIONS.background.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar}>
            {isGeneratingAvatar ? "Generating..." : "Generate Avatar"}
          </Button>

          {/* Avatar Preview */}
          {avatarImage && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generated Avatar</span>
                <Button variant="outline" size="sm" onClick={downloadAvatar}>
                  Download
                </Button>
              </div>
              
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${avatarImage}`}
                  alt="Generated avatar"
                  className="w-48 h-48 rounded-lg border object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerativeIdentityPage;